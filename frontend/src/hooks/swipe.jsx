import { useRef } from "react";

export default function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
    const touchStartX = useRef(null);

    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
        if (touchStartX.current === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartX.current - touchEndX;

        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                onSwipeLeft?.();
            } else {
                onSwipeRight?.();
            }
        }

        touchStartX.current = null;
    };

    return {
        onTouchStart,
        onTouchEnd
    };
}