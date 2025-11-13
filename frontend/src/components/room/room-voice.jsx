import backward from "../../assets/backward-icon.png"
import dots from "../../assets/dots-icon.png"
import room from "../../assets/room-icon.jpg"
import friend from "../../assets/friend-icon.jpg"
import user from "../../assets/user-photo.jpg"
import micON from "../../assets/microphone-on.svg"
import headON from "../../assets/headphone-on.svg"
import micOFF from "../../assets/mic-off.png"
import headOFF from "../../assets/head-off.png"

import { useLayoutEffect, useRef, useState } from "react";
import {Link} from "react-router-dom";

import RoomMenu from "./room-menu"
import RoomSwitch from "./room-switch"
import '../../css/left-block.css'

export default function RoomVoiceChat({ active, setActive }) { 

    const listRef = useRef(null);
    const [canScroll, setCanScroll] = useState(false);

    // Проверяем, превышает ли scrollHeight высоту контейнера
    useLayoutEffect(() => {
        const el = listRef.current;
        if (el) {
        setCanScroll(el.scrollHeight > el.clientHeight);
        }
    }, []);

    const [menuVisible, setMenuVisible] = useState(false);

    const toggleMenu = () => {
        setMenuVisible(prev => !prev); // переключаем состояние
    };

    const [micOn, setMicOn] = useState(true);
    const [headphonesOn, setHeadphonesOn] = useState(true);

    return (
        <main className="left-block">
            <div className="left-block-header">
                <Link to="/start">
                    <img src={backward} className="left-block-header-btn"/>
                </Link>
                <div className="left-block-header-name">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </div>
                <div className="dots-wrapper">
                    <img
                        src={dots}
                        className="left-block-header-btn"
                        alt="menu"
                        onClick={toggleMenu}
                    />

                    {menuVisible && (
                        <RoomMenu onCancel={() => setMenuVisible(false)} />
                    )}
                </div>
            </div>
            <div className="voice-chat">
                <p className="voice-chat-header">Голосовой чат</p>
                <ul ref={listRef} className="voice-chat-members">
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                </ul>
                {canScroll && <div className="voice-gradient-overlay" />}
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
            <RoomSwitch active={active} setActive={setActive}/>
        </main>
    )
}