import minidots from "../../../assets/dots-icon-mini.png"
import friend from "../../../assets/friend-icon.jpg"
import user from "../../../assets/user-photo.jpg"

import FriendMessageMenu from "./friend-message-menu"
import UserMessageMenu from "./user-message-menu"

import '../../../css/chat.css'

import { useState } from "react";

export default function Messages(messages) {
    const [showFriendMenu, setShowFriendMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    return (
        <>
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
        </>
        
    )
}