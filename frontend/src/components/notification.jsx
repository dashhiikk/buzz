import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";

import useAnchoredPortalPosition from "../hooks/use-anchored-portal-position";

import "../css/notification.css";

export default function NotificationToast({
    message,
    duration = 2500,
    onClose,
    anchorRef,
    usePortal = false,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const toastRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const positionStyle = useAnchoredPortalPosition({
        isOpen: usePortal && Boolean(message),
        anchorRef,
        contentRef: toastRef,
        offset: 6,
        margin: 8,
        zIndex: 3500,
    });

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        setIsVisible(false);

        const showTimer = setTimeout(() => setIsVisible(true), 10);
        const hideTimer = setTimeout(() => setIsVisible(false), duration);
        const removeTimer = setTimeout(() => {
            onCloseRef.current?.();
        }, duration + 400);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
            clearTimeout(removeTimer);
        };
    }, [duration, message]);

    const toastContent = (
        <div
            ref={toastRef}
            style={usePortal ? positionStyle : undefined}
            className={`notification-toast ${
                usePortal ? "notification-toast--floating" : ""
            } ${isVisible ? "show" : "hide"}`}
        >
            <p className="small-text text--light">{message}</p>
        </div>
    );

    if (usePortal && anchorRef?.current) {
        return createPortal(toastContent, document.body);
    }

    return toastContent;
}
