import { useCallback, useMemo} from "react";
import useResponsiveLayout from "./use-responsive-layout";
import usePersistedState from "./use-persisted-state";

export default function useTwoPanelLayout({
    defaultPane = "left",
    storageKey = "two-panel-layout"
} = {}) {
    const { isSinglePane, layoutMode } = useResponsiveLayout();

    const [activePane, setActivePane] = usePersistedState(
        `${storageKey}:activePane`,
        defaultPane
    );

    const openPane = useCallback((pane) => {
        setActivePane(pane);
    }, [setActivePane]);

    const showPane = useCallback(
        (pane) => !isSinglePane || activePane === pane,
        [isSinglePane, activePane]
    );

    const goNext = useCallback(() => {
        setActivePane((prev) => (prev === "left" ? "right" : "left"));
    }, [setActivePane]);

    const goPrev = useCallback(() => {
        setActivePane((prev) => (prev === "right" ? "left" : "right"));
    }, [setActivePane]);

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