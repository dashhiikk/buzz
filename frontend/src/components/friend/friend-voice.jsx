import backward from "../../assets/backward-icon.png"
import dots from "../../assets/dots-icon.png"
import friend from "../../assets/friend-icon.jpg"
import user from "../../assets/user-photo.jpg"
import micON from "../../assets/microphone-on.svg"
import headON from "../../assets/headphone-on.svg"
import micOFF from "../../assets/mic-off.png"
import headOFF from "../../assets/head-off.png"

import FriendMenu from "./friend-menu"
import List from "../list"

import {Link} from "react-router-dom";
import { useState } from "react";

import '../../css/left-block.css'
import '../../css/voice-chat.css'

export default function FriendVoiceChat() {

    const [micOn, setMicOn] = useState(true);
    const [headphonesOn, setHeadphonesOn] = useState(true);

    const [menuVisible, setMenuVisible] = useState(false);

    const toggleMenu = () => {
        setMenuVisible(prev => !prev);
    };

    const voiceMembers = [
        { id: 1, name: "Ник друга", avatar: friend},
    ];

    return (
        <main className="left-block">
            <div className="left-block-header">
                <Link to="/start">
                    <img src={backward} className="left-block-header-btn"/>
                </Link>
                <div className="left-block-header-name">
                    <img src={friend}></img>
                    <p className="medium-text text--light">Ник друга</p>
                </div>
                <div className="dots-wrapper">
                    <img src={dots} className="left-block-header-btn" onClick={toggleMenu}></img>
                    {menuVisible &&
                        <FriendMenu onCancel={() => setMenuVisible(false)}/>
                    }
                </div>
                
            </div>
            <div className="friend-voice-chat">
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