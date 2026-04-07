import minidots from "../../../assets/dots-mini.svg"
import defaultAvatar from "../../../assets/user-icon.svg"

import FriendMessageMenu from "./friend-message-menu"
import UserMessageMenu from "./user-message-menu"

import '../../../css/chat.css'

import { useState } from "react";
import { useAuth } from "../../../hooks/use-auth";

export default function Messages({ messages }) {
    const { user } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    if (!Array.isArray(messages)) return null;

    return (
        <>
            {messages.map((msg) => {
                const isCurrentUser = msg.senderId === user?.id;
                return (
                    <div key={msg.id} className={isCurrentUser ? "user-message" : "friend-message"}>
                        {!isCurrentUser && <img src={msg.senderAvatar || defaultAvatar} alt="avatar" />}
                        <div>
                            <div className="message-name">
                                {!isCurrentUser && <p>{msg.senderName || "Неизвестный"}</p>}
                                <div className="minidots-wrapper">
                                    <img
                                        src={minidots}
                                        onClick={() => setShowMenu(prev => prev === msg.id ? null : msg.id)}
                                        alt="menu"
                                    />
                                    {showMenu === msg.id && (isCurrentUser ? <UserMessageMenu /> : <FriendMessageMenu />)}
                                </div>
                                {isCurrentUser && <p>{user.username}</p>}
                            </div>
                            <p className="message-text">{msg.text}</p>
                        </div>
                        {isCurrentUser && <img src={user?.avatar || defaultAvatar} alt="avatar" />}
                    </div>
                );
            })}
        </>
    );
}