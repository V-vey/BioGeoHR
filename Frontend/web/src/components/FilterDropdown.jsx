import { useState, useRef, useEffect } from "react";

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-center mb-2">{label}</div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-1.5 text-sm text-[#8a90a3] cursor-pointer"
          >
            <input
              type="radio"
              name={label}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="accent-green-500 w-4 h-4"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

function DateRangeGroup({ label, value, onChange }) {
  const { from = "", to = "" } = value || {};
  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-center mb-2">{label}</div>
      <div className="flex items-center justify-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => onChange({ from: e.target.value, to })}
          className="border border-[#eef0f5] rounded-lg px-2 py-1 text-sm text-[#8a90a3]"
        />
        <span className="text-[#8a90a3]">—</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className="border border-[#eef0f5] rounded-lg px-2 py-1 text-sm text-[#8a90a3]"
        />
      </div>
    </div>
  );
}

function defaultDraft(config) {
  return config.reduce((acc, field) => {
    if (field.type === "radio") acc[field.key] = field.options[0];
    if (field.type === "dateRange") acc[field.key] = { from: "", to: "" };
    return acc;
  }, {});
}

export default function FilterDropdown({ config, onApply, arrowSize = 32 }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => defaultDraft(config));
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function update(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleConfirm() {
    onApply(draft);
    setOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: arrowSize, height: arrowSize }}
        className="border border-[#eef0f5] rounded-[6px] bg-white cursor-pointer flex items-center justify-center text-[#8a90a3] hover:bg-gray-50"
      >
        ☰
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#eef0f5] rounded-[14px] shadow-lg p-4 z-10">
          {config.map((field) =>
            field.type === "radio" ? (
              <RadioGroup
                key={field.key}
                label={field.label}
                options={field.options}
                value={draft[field.key]}
                onChange={(v) => update(field.key, v)}
              />
            ) : (
              <DateRangeGroup
                key={field.key}
                label={field.label}
                value={draft[field.key]}
                onChange={(v) => update(field.key, v)}
              />
            ),
          )}

          <button
            onClick={handleConfirm}
            className="w-full mt-2 bg-green-500 text-white rounded-full py-1.5 text-sm hover:bg-green-600"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
