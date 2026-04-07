import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(roomId) {
    const [messages, setMessages] = useState([]);
    const ws = useRef(null);

    const sendMessage = useCallback((text, files = []) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'message',
                payload: { text, files }
            }));
        } else {
            console.warn('WebSocket not connected');
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !roomId) return;

        // Подключаемся к WebSocket с токеном в query
        const wsUrl = `ws://localhost:8080/ws/chat?roomId=${roomId}&token=${token}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'message') {
                    // Добавляем новое сообщение в список
                    setMessages(prev => [...prev, data.data]);
                }
            } catch (err) {
                console.error('Failed to parse message', err);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [roomId]);

    return { messages, sendMessage };
}