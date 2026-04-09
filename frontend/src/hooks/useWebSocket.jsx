import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(roomId, callbacks = {}) {
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const callbacksRef = useRef(callbacks);
    const connectingRef = useRef(false);

    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    useEffect(() => {
        if (!roomId) return;
        // Уже есть открытое соединение
        if (socketRef.current?.readyState === WebSocket.OPEN) return;
        // Уже идёт подключение
        if (connectingRef.current) return;
        connectingRef.current = true;

        const token = localStorage.getItem('token');
        const ws = new WebSocket(`ws://localhost:8080/ws/chat?roomId=${roomId}&token=${token}`);

        ws.onopen = () => {
            console.log('WebSocket opened');
            socketRef.current = ws;
            connectingRef.current = false;
        };
        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
            connectingRef.current = false;
        };
        ws.onclose = () => {
            console.log('WebSocket closed');
            socketRef.current = null;
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'message':
                    setMessages(prev => [...prev, data.data]);
                    break;
                case 'message_deleted':
                    setMessages(prev => prev.filter(m => m.id !== data.data.messageId));
                    callbacksRef.current.onMessageDeleted?.(data.data);
                    break;
                case 'message_pinned':
                    setMessages(prev => prev.map(m =>
                        m.id === data.data.messageId ? { ...m, isPinned: true } : m
                    ));
                    callbacksRef.current.onMessagePinned?.(data.data);
                    break;
                case 'message_unpinned':
                    callbacksRef.current.onMessageUnpinned?.(data.data);
                    break;
                default:
                    console.warn('Unknown message type:', data.type);
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            if (socketRef.current === ws) socketRef.current = null;
            connectingRef.current = false;
        };
    }, [roomId]);

    const sendMessage = useCallback((text, files = []) => {
        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'message',
                payload: { text, files }
            }));
        } else {
            console.warn('WebSocket is not open');
        }
    }, []);

    return { messages, sendMessage };
}