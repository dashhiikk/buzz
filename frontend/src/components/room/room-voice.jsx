import backward from "../../assets/backward-icon.png"
import dots from "../../assets/dots-icon.png"
import room from "../../assets/room-icon.jpg"
import friend from "../../assets/friend-icon.jpg"
import user from "../../assets/user-photo.jpg"
import micON from "../../assets/microphone-on.svg"
import headON from "../../assets/headphone-on.svg"
import micOFF from "../../assets/mic-off.png"
import headOFF from "../../assets/head-off.png"

import { useState } from "react";
import {Link} from "react-router-dom";

import RoomMenu from "./room-menu"
import RoomMembers from "./members"
import List from "../list"

import '../../css/left-block.css'
import '../../css/voice-chat.css'

export default function RoomVoiceChat() { 

    const [menuVisible, setMenuVisible] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);

    const openMembersModal = () => {
        setMenuVisible(false);      // закрываем меню
        setIsMembersOpen(true);     // открываем модалку
    };

    const toggleMenu = () => {
        setMenuVisible(prev => !prev); // переключаем состояние
    };

    const [micOn, setMicOn] = useState(true);
    const [headphonesOn, setHeadphonesOn] = useState(true);

    const voiceMembers = [
        { id: 1, name: "Ник друга", avatar: friend},
        { id: 2, name: "Ник друга", avatar: friend},
        { id: 3, name: "Ник друга", avatar: friend },
        { id: 4, name: "Ник друга", avatar: friend },
        { id: 5, name: "Ник друга", avatar: friend },
        { id: 6, name: "Ник друга", avatar: friend },
        { id: 7, name: "Ник друга", avatar: friend },
        { id: 8, name: "Ник друга", avatar: friend },
        { id: 9, name: "Ник друга", avatar: friend },
        { id: 10, name: "Ник друга", avatar: friend },
        { id: 11, name: "Ник друга", avatar: friend },
        { id: 12, name: "Ник друга", avatar: friend },
        { id: 13 , name: "Ник друга", avatar: friend },
    ];

    return (
        <main className="left-block">
            <div className="left-block-header">
                <Link to="/start">
                    <img src={backward} className="left-block-header-btn"/>
                </Link>
                <div className="left-block-header-name">
                    <img src={room}></img>
                    <p className="medium-text text--light">Название комнаты</p>
                </div>
                <div className="dots-wrapper">
                    <img
                        src={dots}
                        className="left-block-header-btn"
                        alt="menu"
                        onClick={toggleMenu}
                    />

                    {menuVisible && (
                        <RoomMenu 
                            onCancel={() => setMenuVisible(false)}
                            onOpenMembers={openMembersModal} 
                        />
                    )}

                    <RoomMembers
                        isOpen={isMembersOpen}
                        onClose={() => setIsMembersOpen(false)}
                    />
                </div>
            </div>
            <div className="voice-chat">
                <p className="voice-chat-header">Голосовой чат</p>
                <List items={voiceMembers} mode="passive" color="dark"/>
                <button className="invite-voice-chat-btn"> 
                    <p>Присоединиться</p>
                </button>
            </div>
            <div className="user-voice">
                <div className="user-voice-chat-member">
                    <img src={user}></img>
                    <p>Мой ник</p>
                </div>
                <div className="voice-icons">
                    <img 
                        src={micOn? micON : micOFF}
                        onClick={() => setMicOn(prev => !prev)}
                    />
                    <img 
                    src={headphonesOn? headON : headOFF}
                    onClick={() => setHeadphonesOn(prev => !prev)}/>
                </div>

            </div>
        </main>
    )
}