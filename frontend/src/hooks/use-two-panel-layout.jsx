import { useCallback, useEffect, useMemo, useState } from "react";
import useResponsiveLayout from "./use-responsive-layout";

export default function useTwoPanelLayout({
    defaultPane = "left"
} = {}) {
    const { isSinglePane, layoutMode } = useResponsiveLayout();
    const [activePane, setActivePane] = useState(defaultPane);

    useEffect(() => {
        if (isSinglePane) {
            setActivePane(defaultPane);
        }
    }, [isSinglePane, defaultPane]);

    const openPane = useCallback((pane) => {
        setActivePane(pane);
    }, []);

    const showPane = useCallback(
        (pane) => !isSinglePane || activePane === pane,
        [isSinglePane, activePane]
    );

    const goNext = useCallback(() => {
        setActivePane((prev) => (prev === "left" ? "right" : "left"));
    }, []);

    const goPrev = useCallback(() => {
        setActivePane((prev) => (prev === "right" ? "left" : "right"));
    }, []);

    return useMemo(() => {
        return {
            isSinglePane,
            layoutMode,
            activePane,
            openPane,
            showPane,
            goNext,
            goPrev,
            showSwitchers: isSinglePane
        };
    }, [
        isSinglePane,
        layoutMode,
        activePane,
        openPane,
        showPane,
        goNext,
        goPrev
    ]);
}