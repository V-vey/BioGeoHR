import { useEffect, useRef } from "react";
import { Check, X, TriangleAlert } from "lucide-react";
import { useDialogs, closeDialog } from "@/lib/dialog";

// the four kinds, in the school's colours
const KINDS = {
  success: { color: "#2AAF56", text: "#ffffff", icon: <Check className="w-6 h-6" /> },
  error: { color: "#EC6668", text: "#ffffff", icon: <X className="w-6 h-6" /> },
  warning: { color: "#EACA3A", text: "#412402", icon: <TriangleAlert className="w-6 h-6" /> },
  confirm: { color: "#6675EC", text: "#ffffff", icon: <span className="text-xl font-bold leading-none">?</span> },
};

// Draws the first waiting pop-up from lib/dialog.js. Mount it once, next to the router.
export default function DialogHost() {
  const dialogs = useDialogs();
  const dialog = dialogs[0];
  const primary = useRef(null);

  // Esc closes a notice (or answers "no" to a question); the main button has the focus,
  // so Enter works too
  useEffect(() => {
    if (!dialog) return;
    primary.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") closeDialog(dialog.id, false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  if (!dialog) return null;
  const kind = KINDS[dialog.kind] ?? KINDS.error;
  const isQuestion = dialog.kind === "confirm";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-5"
      // a notice closes on a click outside; a question needs a real answer
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isQuestion) closeDialog(dialog.id, false);
      }}
    >
      <div
        role={isQuestion ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        className="flex flex-col items-center gap-2 bg-white rounded-xl px-6 pt-6 pb-5 w-full max-w-[340px] text-center"
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center mb-1"
          style={{ backgroundColor: kind.color, color: kind.text }}
        >
          {kind.icon}
        </div>
        {/* inline colour: a global h2 style in index.css would otherwise win */}
        <h2 id="dialog-title" className="font-bold text-[17px]" style={{ color: "#3A3A3A" }}>
          {dialog.title}
        </h2>
        {dialog.message && (
          <p id="dialog-message" className="text-sm text-[#8a90a3] leading-relaxed break-words whitespace-pre-line max-w-full">
            {dialog.message}
          </p>
        )}
        <div className="flex flex-row gap-2 w-full mt-3">
          {isQuestion && (
            <button
              type="button"
              onClick={() => closeDialog(dialog.id, false)}
              className="flex-1 py-1.5 rounded-full border border-[#b2b2b2] text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            ref={primary}
            type="button"
            onClick={() => closeDialog(dialog.id, true)}
            style={{ backgroundColor: kind.color, color: kind.text }}
            className="flex-1 py-1.5 rounded-full text-sm font-medium hover:opacity-90"
          >
            {isQuestion ? dialog.confirmLabel : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
