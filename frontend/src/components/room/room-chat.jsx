import send from "../../assets/send.svg" 
import put from "../../assets/paperclip.svg"
import pin from "../../assets/pin.svg"
import copy from "../../assets/copy.svg"

import '../../css/chat.css'
import '../../css/right-block.css'

import { useEffect, useLayoutEffect, useRef, useMemo, useState } from "react";
import { useWebSocket } from "../../hooks/useWebSocket";

import Messages from "./message/messages"

export default function RoomChat({ roomId, initialMessages = [] }) {

    const [newMessage, setNewMessage] = useState("");
    const [historyMessages] = useState(initialMessages);
    const { messages: wsMessages, sendMessage } = useWebSocket(roomId);
    const chatRef = useRef(null);
    const textRef = useRef(null);
    const [canScroll, setCanScroll] = useState(false);

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

    return (
        <main className="right-block">
            <div className="right-block-header">
                <p className="large-text text--light">Чат</p>
            </div>
            <div className="pinned-message">
                <img src={pin}/>
                <div className="pinned-message-wrapper">
                    <p ref={textRef} className="pinned-message-text">
                    Археологи установили, что монеты были отчеканены во времена короля Кнута Эрикссона, 
                    правившего Швецией во второй половине XII века. На них можно различить надпись KANUTUS. 
                    По словам экспертов, клад был зарыт примерно в XII веке, то есть задолго до основания самого Стокгольма, 
                    который появился лишь в 1252 году.
                    </p>
                </div>
                <img src={copy} className="copy-pinned-message" onClick={handleCopy}/>
                {canScroll && <div className="pin-gradient-overlay" />}
            </div>
            <div ref={chatRef} className="message-block">
                <Messages messages={allMessages} />
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