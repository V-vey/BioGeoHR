import { useRef } from "react";
import { Calendar } from "lucide-react";

// A date box that keeps the year to 4 digits. The browser's own date box lets you type 5 or 6 digits
// (2026 becomes 202610); this one refuses them, and has a sensible default range. It works with a
// controlled box (value + onChange) and with an uncontrolled one (no value).
// The calendar icon on the right is a real button that opens the date picker (the browser's own
// small button is hidden, so there is one icon and it is easy to click).
// wrapperClassName is for the box around the input and its icon, e.g. a max width.
export default function DateInput({
  value,
  onChange,
  min = "1900-01-01",
  max = "2100-12-31",
  className = "",
  wrapperClassName = "",
  style,
  ref: outerRef,
  ...rest
}) {
  // for a box without a value prop: the last date that was fine
  const lastGood = useRef("");
  const inputRef = useRef(null);

  // our own ref for the icon, and the one a parent may have asked for
  const setRef = (el) => {
    inputRef.current = el;
    if (typeof outerRef === "function") outerRef(el);
    else if (outerRef) outerRef.current = el;
  };

  const handleChange = (e) => {
    // a complete date with a year of more than 4 digits looks like "202610-10-19": go back to the
    // current value (controlled box) or to the last good one (uncontrolled box)
    if (/^\d{5,}-/.test(e.target.value)) {
      e.target.value = value !== undefined ? value : lastGood.current;
      return;
    }
    lastGood.current = e.target.value;
    onChange?.(e);
  };

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.focus(); // a browser without showPicker: the box is at least ready to type in
    }
  };

  // a full-width box keeps its full width; any other box is only as wide as it was
  const wide = /(^|\s)w-full(\s|$)/.test(className);

  return (
    <span
      className={`relative ${wide ? "flex w-full" : "inline-flex"} ${wrapperClassName}`}
    >
      <input
        {...rest}
        ref={setRef}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        className={`${className} [&::-webkit-calendar-picker-indicator]:hidden`}
        style={{ paddingRight: "2rem", ...style }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Open calendar"
        disabled={rest.disabled || rest.readOnly}
        onClick={openPicker}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6675EC] disabled:opacity-40 disabled:hover:text-gray-400"
      >
        <Calendar className="w-4 h-4" />
      </button>
    </span>
  );
}
