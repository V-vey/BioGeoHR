import { useEffect, useRef, useState } from "react";

/**
 * Shared open/close behavior for the search-bar filter dropdown used
 * on the Employees and Attendance pages. Closes itself when the user
 * clicks outside the panel.
 */
export function useFilterPanel() {
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            const clickedInsidePanel = panelRef.current?.contains(event.target);
            const clickedTheButton = buttonRef.current?.contains(event.target);
            if (!clickedInsidePanel && !clickedTheButton) {
                setOpen(false);
            }
        }

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return { open, setOpen, panelRef, buttonRef };
}
