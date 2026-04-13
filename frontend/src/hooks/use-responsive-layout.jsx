import { useContext } from "react";
import ResponsiveLayoutContext from "../context/responsive-layout-context";

export default function useResponsiveLayout() {
    const context = useContext(ResponsiveLayoutContext);

    if (!context) {
        throw new Error("useResponsiveLayout must be used inside ResponsiveLayoutProvider");
    }

    return context;
}