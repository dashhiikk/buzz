import { useState, useEffect } from "react";

export default function useIsPortrait() {
    const [isPortrait, setIsPortrait] = useState(
        window.innerHeight > window.innerWidth || window.innerWidth < 900
    );

    useEffect(() => {
        const onResize = () => {
            setIsPortrait(
                window.innerHeight > window.innerWidth || window.innerWidth < 900
            );
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return isPortrait;
}