import { useState, useEffect } from "react";

export default function useIsPortrait() {
    const [isPortrait, setIsPortrait] = useState(
        window.innerWidth < window.innerHeight
    );

    useEffect(() => {
        const onResize = () => {
            setIsPortrait(window.innerWidth < window.innerHeight);
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return isPortrait;
}