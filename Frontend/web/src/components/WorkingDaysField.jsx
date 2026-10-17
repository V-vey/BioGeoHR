import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Common choices, from the paper (FR24): 261 working days a year / 12 = 21.75 for a 5-day week,
// 313 / 12 = 26.08 for a 6-day week. Any other number can be typed.
const PRESETS = [
  { value: "21.75", note: "DOLE 5 days work week" },
  { value: "26", note: "DEFAULT" },
];

// one box: pick a preset from the list, or type any number from 1 to 31 (up to 2 decimals)
export default function WorkingDaysField({
  value,
  onChange,
  className = "",
  required = true,
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef(null);
  const shown = value == null ? "" : String(value);

  // close when the user clicks somewhere else
  useEffect(() => {
    if (!open) return;
    const away = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  const pick = (v) => {
    onChange(v);
    setOpen(false);
    setActive(-1);
  };

  const type = (e) => {
    // digits and one dot only, at most 2 decimals
    const text = e.target.value.replace(/[^\d.]/g, "");
    const [whole, ...rest] = text.split(".");
    onChange(rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % PRESETS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i <= 0 ? PRESETS.length - 1 : i - 1));
    } else if (e.key === "Enter" && open && active >= 0) {
      e.preventDefault(); // choose the highlighted row, do not submit the form
      pick(PRESETS[active].value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={box}>
      <input
        type="text"
        inputMode="decimal"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="none"
        autoComplete="off"
        required={required}
        placeholder="Select or type"
        pattern="([1-9]|[12][0-9]|3[01])(\.[0-9]{1,2})?"
        title="A number from 1 to 31, for example 22 or 21.75"
        className={`${className} pr-8`}
        value={shown}
        onChange={type}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <ChevronDown
        className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${
          open ? "rotate-180" : ""
        }`}
      />
      {open && (
        <ul
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 bg-white border border-[#b2b2b2] rounded-[10px] shadow-md overflow-hidden text-left"
        >
          {PRESETS.map((p, i) => (
            <li
              key={p.value}
              role="option"
              aria-selected={Number(shown) === Number(p.value)}
              // mousedown, not click, so the choice lands before the box loses focus
              onMouseDown={(e) => {
                e.preventDefault();
                pick(p.value);
              }}
              onMouseEnter={() => setActive(i)}
              className={`px-3 py-2 cursor-pointer text-sm ${
                active === i ? "bg-[#6675EC]/10" : ""
              } ${Number(shown) === Number(p.value) ? "font-semibold" : ""}`}
            >
              {p.value}
              {p.note && (
                <span className="ml-2 text-xs text-gray-400">{p.note}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
