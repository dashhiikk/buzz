import friend from "../../assets/friend-icon.jpg"
import user from "../../assets/user-photo.jpg"
import send from "../../assets/send-icon.svg" 
import put from "../../assets/paperclip-icon.svg"
import pin from "../../assets/pin-icon.png"
import copy from "../../assets/copy-icon.png"
import minidots from "../../assets/dots-icon-mini.png"

import '../../css/chat.css'

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import FriendMessageMenu from "../friend-message-menu"
import UserMessageMenu from "../user-message-menu"

export default function RoomChat() {

    const textRef = useRef(null);
    const [canScroll, setCanScroll] = useState(false);
    
    // Проверяем, превышает ли scrollHeight высоту контейнера
    useLayoutEffect(() => {
        const el = textRef.current;
        if (el) {
            setCanScroll(el.scrollHeight > el.clientHeight);
        }
    }, []);

    const [showFriendMenu, setShowFriendMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const chatRef = useRef(null);

    

    const [newMessage, setNewMessage] = useState("");

    const handleSend = () => {
        if (newMessage.trim() === "") return;
        setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, sender: "user", text: newMessage },
        ]);
        setNewMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
        }
    };

    const [messages, setMessages] = useState([
        { id: 1, sender: "friend", text: "Привет!" },
        { id: 2, sender: "user", text: "Здарова!" },
        { id: 3, sender: "friend", text: "Как дела?" },
        { id: 4, sender: "friend", text: "Как дела?" },
        { id: 5, sender: "friend", text: "Как дела?" },
        { id: 6, sender: "user", text: "Здарова!" },
        { id: 7, sender: "user", text: "Здарова!" },
        { id: 8, sender: "friend", text: "Как дела?" },
        { id: 9, sender: "user", text: "Здарова!" },
        { id: 10, sender: "friend", text: "Как дела?" },
        { id: 11, sender: "friend", text: "Как дела?" },
        { id: 12, sender: "user", text: "Здарова!" },
        { id: 13, sender: "user", text: "Здарова!" },
        { id: 14, sender: "user", text: "Здарова!" },
        { id: 15, sender: "friend", text: "Как дела?" },
        { id: 16, sender: "user", text: "Здарова!" },
        { id: 17, sender: "user", text: "Здарова!" },
    ]);

    useEffect(() => {
        const el = chatRef.current;
        if (el) {
        el.scrollTop = el.scrollHeight;
        }
    }, [messages]);

    const handleCopy = () => {
        if (textRef.current) {
        // Копируем текст в буфер
        navigator.clipboard.writeText(textRef.current.innerText)
            .then(() => {
            console.log("Текст скопирован!");
            })
            .catch((err) => {
            console.error("Ошибка копирования:", err);
            });
        }
    };

    return (
        <main className="chat-block">
            <div className="chat-header">
                <p>Чат</p>
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
                {messages.map((msg) => msg.sender === "friend" ? (
                    <div key={msg.id} className="friend-message">
                        <img src={friend}></img>
                        <div>
                            <div className="message-name">
                                <p>Ник друга</p>
                                <div className="minidots-wrapper">
                                    <img src={minidots} onClick={() => setShowFriendMenu(prev => prev === msg.id ? null : msg.id)}/>
                                    {showFriendMenu === msg.id && 
                                        <FriendMessageMenu/>
                                    }
                                </div>
                            </div>
                            <p className="message-text">{msg.text}</p>
                        </div>
                    </div>
                ) : (
                    <div key={msg.id} className="user-message">
                        <div>
                            <div className="message-name">
                                <div className="minidots-wrapper">
                                    <img src={minidots} onClick={() => setShowUserMenu(prev => prev === msg.id ? null : msg.id)}/>
                                    {showUserMenu === msg.id && 
                                        <UserMessageMenu/>
                                    }
                                </div>
                                <p>Мой ник</p>
                            </div>
                            
                            <p className="message-text">{msg.text}</p>
                        </div> 
                        <img src={user}></img>
                    </div>
                    )
                )}
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