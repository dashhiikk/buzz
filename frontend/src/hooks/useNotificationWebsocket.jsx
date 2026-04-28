import { useEffect, useRef } from "react";
import { tokenManager } from "../context/tokenManager";

export function useNotificationWebSocket(userId, callbacks = {}) {
    const socketRef = useRef(null);
    const callbacksRef = useRef(callbacks);
    const connectingRef = useRef(false);
    const reconnectTimeoutRef = useRef(null);

    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    useEffect(() => {
        if (!userId) return;

        let isActive = true;

        const clearReconnectTimeout = () => {
            if (reconnectTimeoutRef.current) {
                window.clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        const scheduleReconnect = () => {
            if (!isActive || reconnectTimeoutRef.current) {
                return;
            }

            reconnectTimeoutRef.current = window.setTimeout(() => {
                reconnectTimeoutRef.current = null;
                connect();
            }, 1500);
        };

        const connect = () => {
            const token = tokenManager.getToken();

            if (!isActive || !token) return;
            if (socketRef.current?.readyState === WebSocket.OPEN) return;
            if (socketRef.current?.readyState === WebSocket.CONNECTING) return;
            if (connectingRef.current) return;

            connectingRef.current = true;

            const ws = new WebSocket(
                `ws://localhost:8080/ws/notifications?token=${encodeURIComponent(token)}`
            );

            ws.onopen = () => {
                socketRef.current = ws;
                connectingRef.current = false;
                clearReconnectTimeout();
                console.log("Notifications WebSocket opened");
            };

            ws.onerror = (err) => {
                console.error("Notifications WebSocket error:", err);
            };

            ws.onclose = () => {
                console.log("Notifications WebSocket closed");
                if (socketRef.current === ws) {
                    socketRef.current = null;
                }
                connectingRef.current = false;
                scheduleReconnect();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    callbacksRef.current.onNotification?.(data);
                } catch (err) {
                    console.error("Failed to parse notification payload:", err);
                }
            };

            socketRef.current = ws;
        };

        connect();

        return () => {
            isActive = false;
            clearReconnectTimeout();
            connectingRef.current = false;

            const socket = socketRef.current;
            if (
                socket?.readyState === WebSocket.OPEN ||
                socket?.readyState === WebSocket.CONNECTING
            ) {
                socket.close();
            }
            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        };
    }, [userId]);

    return {
        socket: socketRef.current,
    };
}
