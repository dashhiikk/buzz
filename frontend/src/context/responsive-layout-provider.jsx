import { useEffect, useMemo, useState } from "react";
import ResponsiveLayoutContext from "./responsive-layout-context";

function getIsSinglePane(breakpoint) {
    if (typeof window === "undefined") return false;

    return (
        window.innerWidth < breakpoint ||
        window.innerHeight > window.innerWidth
    );
}

export default function ResponsiveLayoutProvider({
    children,
    breakpoint = 900
}) {
    const [isSinglePane, setIsSinglePane] = useState(() =>
        getIsSinglePane(breakpoint)
    );

    useEffect(() => {
        let rafId = null;

        const updateLayout = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                setIsSinglePane(getIsSinglePane(breakpoint));
            });
        };

        updateLayout();

        window.addEventListener("resize", updateLayout);
        window.addEventListener("orientationchange", updateLayout);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", updateLayout);
            window.removeEventListener("orientationchange", updateLayout);
        };
    }, [breakpoint]);

    const value = useMemo(() => {
        return {
            isSinglePane,
            layoutMode: isSinglePane ? "single" : "split"
        };
    }, [isSinglePane]);

    return (
        <ResponsiveLayoutContext.Provider value={value}>
            {children}
        </ResponsiveLayoutContext.Provider>
    );
}