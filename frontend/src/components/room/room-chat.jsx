import send from "../../assets/send.svg" 
import put from "../../assets/paperclip.svg"
import pin from "../../assets/pin.svg"
import copy from "../../assets/copy.svg"

import '../../css/chat.css'
import '../../css/right-block.css'

import { useEffect, useLayoutEffect, useRef, useMemo, useState } from "react";
import { useWebSocket } from "../../hooks/useWebSocket";
import { getPinnedMessage, pinMessage } from "../../api/rooms";

import Messages from "./message/messages"

export default function RoomChat({ roomId, initialMessages = [] }) {

    const [newMessage, setNewMessage] = useState("");
    const [historyMessages] = useState(initialMessages);
    const { messages: wsMessages, sendMessage } = useWebSocket(roomId);
    const chatRef = useRef(null);
    const textRef = useRef(null);
    const [canScroll, setCanScroll] = useState(false);
    const [pinnedMessage, setPinnedMessage] = useState(null);

    const allMessages = useMemo(() => [...historyMessages, ...wsMessages], [historyMessages, wsMessages]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [allMessages]);

    useLayoutEffect(() => {
        const el = textRef.current;
        if (el) {
            setCanScroll(el.scrollHeight > el.clientHeight);
        }
    }, []);


    const handleSend = () => {
        if (newMessage.trim() === "") return;
        sendMessage(newMessage);
        setNewMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCopy = () => {
        if (textRef.current) {
            navigator.clipboard.writeText(textRef.current.innerText)
                .catch(err => console.error("Copy failed:", err));
        }
    };

    const handleDeleteMessage = (deletedId) => {
        // Обновляем allMessages, удаляя сообщение с этим id
        // Но allMessages вычисляется из historyMessages и wsMessages – нужно обновить состояние.
        // Проще всего перезагрузить историю или использовать локальное состояние.
        // Для простоты: установить флаг, что сообщение удалено, или отфильтровать.
        setHistoryMessages(prev => prev.filter(m => m.id !== deletedId));
        // Для wsMessages нужно либо тоже отфильтровать (но они в состоянии), либо оставить как есть.
        // Лучше использовать единый массив сообщений в состоянии, а не useMemo.
    };

    useEffect(() => {
        const fetchPinned = async () => {
            try {
                const res = await getPinnedMessage(roomId);
                setPinnedMessage(res.data);
            } catch (err) {
                console.error("Failed to get pinned message:", err);
            }
        };
        fetchPinned();
    }, [roomId]);

    const handlePinMessage = async (messageId) => {
        try {
            await pinMessage(roomId, messageId);
            // Обновляем закреплённое сообщение
            const res = await getPinnedMessage(roomId);
            setPinnedMessage(res.data);
        } catch (err) {
            console.error("Failed to pin message:", err);
            alert("Не удалось закрепить сообщение");
        }
    };

    return (
        <main className="right-block">
            <div className="right-block-header">
                <p className="large-text text--light">Чат</p>
            </div>
            <div className="pinned-message">
                <img src={pin}/>
                <div className="pinned-message-wrapper">
                    <p ref={textRef} className="pinned-message-text">
                        {pinnedMessage ? pinnedMessage.text : ""}
                    </p>
                </div>
                <img src={copy} className="copy-pinned-message" onClick={handleCopy}/>
                {canScroll && <div className="pin-gradient-overlay" />}
            </div>
            <div ref={chatRef} className="message-block">
                <Messages 
                    messages={allMessages} 
                    roomId = {roomId}
                />
            </div>
            <div className="input-block">
                <textarea
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div className="input-icons">
                    <img src={send} onClick={handleSend}></img>
                    <img src={put}></img>
                </div>
            </div>
        </main>
    );
}