import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BellRing, X } from "lucide-react";
import { url } from "@/resources/api";
import { emitDataChanged } from "@/lib/dataChanged";

const POLL_MS = 15000; // how often the server is asked what is new
const SHOW_MS = 6000; // how long a message stays
const MAX_SHOWN = 4;

// where a message takes you, and its colour
const KINDS = {
  leave: { to: "/employee/leave-request", color: "#6675EC" },
  attendance: { to: "/attendance", color: "#EACA3A" },
  flag: { to: "/attendance/flagged", color: "#EC6668" },
};

// "Maria", "Maria and Ana", "Maria, Ana and 3 more"
const names = (group) => {
  const list = group.items.map((i) => i.name);
  const more = group.count - list.length;
  if (more > 0) return `${list.join(", ")} and ${more} more`;
  return list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list.at(-1)}` : list[0];
};

// the words of one message, from what the server says is new
function describe(kind, group) {
  const one = group.count === 1;
  const first = group.items[0];
  if (kind === "leave")
    return one
      ? { title: "New leave request", text: `${first.name}, ${first.detail}` }
      : { title: `${group.count} new leave requests`, text: names(group) };
  if (kind === "attendance")
    return one
      ? {
          title: first.detail === "Absent" ? "Marked absent" : "Late clock-in",
          text: first.name,
        }
      : { title: `${group.count} late or absent records`, text: names(group) };
  return one
    ? { title: "Flagged attendance", text: `${first.name} ${first.detail}` }
    : { title: `${group.count} flagged attendances`, text: names(group) };
}

// Asks the server every few seconds what is new and shows a small message for it.
// It also tells the open page (emitDataChanged) so the list on screen reloads itself.
export default function Notifier() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);
  const seen = useRef(null); // the newest ids already seen; null until the first answer

  const dismiss = (id) => setToasts((all) => all.filter((t) => t.id !== id));

  useEffect(() => {
    let stopped = false;
    const timers = new Set();

    const show = (kind, group) => {
      const id = nextId.current++;
      setToasts((all) => [...all, { id, kind, ...describe(kind, group) }].slice(-MAX_SHOWN));
      timers.add(setTimeout(() => dismiss(id), SHOW_MS));
    };

    const poll = async () => {
      if (document.hidden) return; // nobody is looking: do not ask
      try {
        const response = await axios.get(url + "/notifications/poll", {
          params: seen.current ?? undefined,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (stopped) return;
        const { latest, new: fresh } = response.data;
        const before = seen.current;
        seen.current = latest;
        if (!before) return; // the first answer only sets the starting point
        Object.keys(fresh).forEach((kind) => show(kind, fresh[kind]));
        const changed = Object.keys(latest).filter((k) => latest[k] > before[k]);
        if (changed.length) emitDataChanged(changed);
      } catch (error) {
        // a missed poll is simply tried again; a refused one (not HR, or logged out) stops
        if ([401, 403].includes(error.response?.status)) stopped = true;
      }
    };

    poll();
    const interval = setInterval(() => !stopped && poll(), POLL_MS);
    const onVisible = () => !document.hidden && !stopped && poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(interval);
      timers.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[300px]" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          onClick={() => {
            dismiss(t.id);
            navigate(KINDS[t.kind].to);
          }}
          style={{ borderLeftColor: KINDS[t.kind].color }}
          className="flex items-start gap-3 bg-white border border-[#b2b2b2] border-l-[4px] px-3 py-2 cursor-pointer text-left shadow-md"
        >
          <BellRing className="w-[18px] h-[18px] mt-0.5 shrink-0" style={{ color: KINDS[t.kind].color }} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{t.title}</p>
            <p className="text-xs text-[#8a90a3] truncate">{t.text}</p>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={(e) => {
              e.stopPropagation();
              dismiss(t.id);
            }}
            className="text-[#8a90a3] hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
