import { useEffect, useRef } from "react";
import { tokenManager } from "../context/tokenManager";

export function useNotificationWebSocket(userId, callbacks = {}) {
    const socketRef = useRef(null);
    const callbacksRef = useRef(callbacks);
    const connectingRef = useRef(false);

    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    useEffect(() => {
        const token = tokenManager.getToken();

        if (!userId || !token) return;
        if (socketRef.current?.readyState === WebSocket.OPEN) return;
        if (connectingRef.current) return;

        connectingRef.current = true;

        const ws = new WebSocket(
            `ws://localhost:8080/ws/notifications?token=${encodeURIComponent(token)}`
        );

        ws.onopen = () => {
            socketRef.current = ws;
            connectingRef.current = false;
            console.log("Notifications WebSocket opened");
        };

        ws.onerror = (err) => {
            console.error("Notifications WebSocket error:", err);
            connectingRef.current = false;
        };

        ws.onclose = () => {
            console.log("Notifications WebSocket closed");
            if (socketRef.current === ws) {
                socketRef.current = null;
            }
            connectingRef.current = false;
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                callbacksRef.current.onNotification?.(data);
            } catch (err) {
                console.error("Failed to parse notification payload:", err);
            }
        };

        return () => {
            if (
                ws.readyState === WebSocket.OPEN ||
                ws.readyState === WebSocket.CONNECTING
            ) {
                ws.close();
            }
            if (socketRef.current === ws) {
                socketRef.current = null;
            }
            connectingRef.current = false;
        };
    }, [userId]);

    return {
        socket: socketRef.current,
    };
}