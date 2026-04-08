import minidots from "../../../assets/dots-mini.svg"
import defaultAvatar from "../../../assets/user-icon.svg"

import FriendMessageMenu from "./friend-message-menu"
import UserMessageMenu from "./user-message-menu"

import '../../../css/chat.css'
import { createPortal } from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from "../../../hooks/use-auth";

export default function Messages({ messages}) {
    const { user } = useAuth();
    const [menuState, setMenuState] = useState({
        visible: false,
        messageId: null,
        isCurrentUser: false,
        side: "right",
        position: { x: 0, y: 0 }
    })
    const menuRef = useRef();

    const handleOpenMenu = (event, msgId, isCurrentUser) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const offset = 5; // можно 5-10, здесь 8px
        const centerY = rect.top + rect.height / 2;

        setMenuState((prev) => ({
            visible: !(prev.visible && prev.messageId === msgId),
            messageId: msgId,
            isCurrentUser,
            side: isCurrentUser ? "left" : "right",
            position: {
                x: isCurrentUser ? rect.left - offset : rect.right + offset,
                y: centerY
            }
        }));
    };

    const handleCloseMenu = () => {
        setMenuState(prev => ({ ...prev, visible: false }));
    };

    // Закрытие при клике вне меню
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                handleCloseMenu();
            }
        };

        if (menuState.visible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuState.visible]);

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
                                        onClick={(event) => handleOpenMenu(event, msg.id, isCurrentUser)}
                                        alt="menu"
                                    />
                                </div>
                                {isCurrentUser && <p>{user.username}</p>}
                            </div>
                            <p className="message-text">{msg.text}</p>
                        </div>
                        {isCurrentUser && <img src={user?.avatar || defaultAvatar} alt="avatar" />}
                    </div>
                );
            })}
            {menuState.visible &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="message-menu-portal"
                        style={{
                            position: "fixed",
                            top: menuState.position.y,
                            left: menuState.position.x,
                            zIndex: 9999,
                            transform:
                                menuState.side === "left"
                                    ? "translate(-100%, -50%)"
                                    : "translate(0, -50%)"
                        }}
                    >
                        {menuState.isCurrentUser ? (
                            <UserMessageMenu 
                                onClose={handleCloseMenu} 
                                messageId={menuState.messageId}
                                onDelete={handleDeleteMessage}
                                onPin={}
                            />
                        ) : (
                            <FriendMessageMenu 
                                onClose={handleCloseMenu} 
                                messageId={menuState.messageId}
                                onPin={}
                            />
                        )}
                    </div>,
                    document.body
            )}
        </>
    );
}