import { useEffect, useRef } from "react";

const EVENT = "biogeohr:data-changed";

// The Notifier calls this when the server reports something new (kinds: "leave", "attendance", "flag").
export const emitDataChanged = (kinds) =>
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { kinds } }));

// A page calls this to reload its own data when one of the given kinds changes.
export function useDataChanged(kinds, onChange) {
  const handler = useRef(onChange);
  useEffect(() => {
    handler.current = onChange;
  });
  const key = kinds.join(",");
  useEffect(() => {
    const listener = (e) => {
      if (e.detail.kinds.some((k) => key.split(",").includes(k))) handler.current();
    };
    window.addEventListener(EVENT, listener);
    return () => window.removeEventListener(EVENT, listener);
  }, [key]);
}
