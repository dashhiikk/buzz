import { useEffect, useRef, useState, useCallback } from "react"

import { tokenManager } from "../context/tokenManager"

export function useWebSocket(roomId, callbacks = {}) {
    const [messages, setMessages] = useState([])
    const socketRef = useRef(null)
    const callbacksRef = useRef(callbacks)
    const connectingRef = useRef(false)
    const reconnectTimeoutRef = useRef(null)
    const shouldReconnectRef = useRef(false)

    useEffect(() => {
        callbacksRef.current = callbacks
    }, [callbacks])

    useEffect(() => {
        if (!roomId) {
            return
        }

        shouldReconnectRef.current = true

        const connect = () => {
            if (socketRef.current?.readyState === WebSocket.OPEN) return
            if (socketRef.current?.readyState === WebSocket.CONNECTING) return
            if (connectingRef.current) return

            connectingRef.current = true

            const token = tokenManager.getToken()
            const ws = new WebSocket(
                `ws://localhost:8080/ws/chat?roomId=${roomId}&token=${token}`
            )

            ws.onopen = () => {
                console.log("WebSocket opened")
                socketRef.current = ws
                connectingRef.current = false
            }

            ws.onerror = (err) => {
                console.error("WebSocket error:", err)
                connectingRef.current = false
            }

            ws.onclose = () => {
                console.log("WebSocket closed")
                if (socketRef.current === ws) {
                    socketRef.current = null
                }
                connectingRef.current = false

                if (shouldReconnectRef.current) {
                    reconnectTimeoutRef.current = window.setTimeout(connect, 1500)
                }
            }

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)
                switch (data.type) {
                    case "message":
                        setMessages((prev) => [...prev, data.data])
                        break
                    case "message_deleted":
                        setMessages((prev) =>
                            prev.filter((message) => message.id !== data.data.messageId)
                        )
                        callbacksRef.current.onMessageDeleted?.(data.data)
                        break
                    case "message_pinned":
                        setMessages((prev) =>
                            prev.map((message) =>
                                message.id === data.data.messageId
                                    ? { ...message, isPinned: true }
                                    : message
                            )
                        )
                        callbacksRef.current.onMessagePinned?.(data.data)
                        break
                    case "message_unpinned":
                        callbacksRef.current.onMessageUnpinned?.(data.data)
                        break
                    default:
                        console.warn("Unknown message type:", data.type)
                }
            }
        }

        connect()

        return () => {
            shouldReconnectRef.current = false

            if (reconnectTimeoutRef.current) {
                window.clearTimeout(reconnectTimeoutRef.current)
                reconnectTimeoutRef.current = null
            }

            if (
                socketRef.current &&
                (socketRef.current.readyState === WebSocket.OPEN ||
                    socketRef.current.readyState === WebSocket.CONNECTING)
            ) {
                socketRef.current.close()
            }

            socketRef.current = null
            connectingRef.current = false
        }
    }, [roomId])

    const sendMessage = useCallback((text, files = []) => {
        const socket = socketRef.current
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    type: "message",
                    payload: { text, files },
                })
            )
            return true
        }

        console.warn("WebSocket is not open")
        return false
    }, [])

    return { messages, sendMessage }
}
