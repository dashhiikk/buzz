import backward from "../../assets/backward.svg"
import link from "../../assets/link.svg"
import dots from "../../assets/dots.svg"
import defaultRoom from "../../assets/room-default.jpg"
import micON from "../../assets/mic-on.svg"
import headON from "../../assets/head-on.svg"
import micOFF from "../../assets/mic-off.svg"
import headOFF from "../../assets/head-off.svg"

import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {Link} from "react-router-dom";
import { useAuth } from "../../hooks/use-auth"
import { leaveRoom } from "../../api/rooms";
import { removeFriend } from "../../api/friends";
import { getInviteLink } from "../../api/rooms";
import {useRoomAdmin} from "../../hooks/useRoomAdmin"
import RoomMenu from "./room-menu"
import RoomMembers from "./members"
import List from "../list"
import SendRequest from "../../modals/send-request"
import Notification from "./invite-link"

import '../../css/left-block.css'
import '../../css/voice-chat.css'

export default function RoomVoiceChat({ room, participants: initialParticipants, jitsiToken, roomId, onParticipantsUpdate }) { 
    const { user } = useAuth();
    const { isAdmin} = useRoomAdmin(roomId);
    const [participants, setParticipants] = useState(initialParticipants);
    const menuRef = useRef(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [headphonesOn, setHeadphonesOn] = useState(true);
    const [setCopying] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setParticipants(initialParticipants);
    }, [initialParticipants]);

    const openMembersModal = () => {
        setMenuVisible(false);      // закрываем меню
        setIsMembersOpen(true);     // открываем модалку
    };

    const openInviteModal = () => {
        setIsMembersOpen(false);      // закрываем меню
        setIsInviteOpen(true);     // открываем модалку
    };

    const toggleMenu = () => {setMenuVisible(prev => !prev); };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const voiceMembers = participants.map(p => ({
        id: p.id,
        name: p.username,
        icon: p.avatar || defaultRoom,
        // status: p.isSpeaking ? "говорит" : undefined
    }));

    const handleLeave = async () => {
        try {
            await leaveRoom(roomId);
            navigate("/start");
        } catch (err) {
            console.error("Failed to leave room:", err);
            alert("Не удалось покинуть комнату");
        }
    };

    const handleRemoveFriend = async () => {
        try {
            // Предполагаем, что в приватной комнате друг – это другой участник
            const friend = participants.find(p => p.id !== user.id);
            if (friend) {
                await removeFriend(friend.id);
                navigate("/start");
            } else {
                console.error("Friend not found");
            }
        } catch (err) {
            console.error("Failed to remove friend:", err);
            alert("Не удалось удалить друга");
        }
    };

    const handleCopyInviteLink = async () => {
        try {
            setCopying(true);
            const response = await getInviteLink(roomId);
            const inviteLink = response.data.link;
            await navigator.clipboard.writeText(inviteLink);
            setNotificationMessage("Ссылка скопирована!");
            setTimeout(() => setNotificationMessage(null), 2000);
        } catch (err) {
            console.error("Failed to get invite link:", err);
            setNotificationMessage("Не удалось скопировать ссылку");
            setTimeout(() => setNotificationMessage(null), 2000);
        } finally {
            setCopying(false);
        }
    };

    const handleParticipantsUpdate = (newParticipants) => {
        setParticipants(newParticipants);
        if (onParticipantsUpdate) {
            onParticipantsUpdate(newParticipants);
        }
    };
 
    return (
        <main className="left-block">
            <div className="left-block-header">
                <Link to="/start">
                    <img src={backward} className="left-block-header-btn"/>
                </Link>
                <div className="left-block-header-name">
                    <img src={room.icon || defaultRoom}></img>
                    <p className="medium-text text--light">{room.name}</p>
                </div>
                <div>
                    <div className="voice-wrapper">
                        <img 
                            src={link} 
                            className="left-block-header-btn" 
                            onClick={handleCopyInviteLink}
                        />
                        {notificationMessage && (
                            <Notification 
                                message={notificationMessage} 
                                onClose={() => setNotificationMessage(null)} 
                            />
                        )}
                    </div>
                    <div className="voice-wrapper" ref={menuRef}>
                        <img
                            src={dots}
                            className="left-block-header-btn"
                            alt="menu"
                            onClick={toggleMenu}
                        />
                        {menuVisible && (

                            room.isPrivate ? (
                                
                                <RoomMenu
                                    type = "friend"
                                    onCancel={() => setMenuVisible(false)}
                                    onRemoveFriend={handleRemoveFriend}
                                />
                            ) : (
                                <RoomMenu
                                    type = "room"
                                    isAdmin={isAdmin}
                                    onCancel={() => setMenuVisible(false)}
                                    onOpenMembers={openMembersModal}
                                    onLeave={handleLeave}
                                />
                            )
                        )}
                        <RoomMembers
                            isOpen={isMembersOpen}
                            onClose={() => setIsMembersOpen(false)}
                            onOpenInvite ={openInviteModal}
                            participants={participants}
                            roomAdminId={room.adminId}
                            isAdmin = {isAdmin}
                            currentUserId={user.id}
                            roomId={roomId}
                            onParticipantsUpdate={handleParticipantsUpdate}
                        />
                        <SendRequest
                            isOpen={isInviteOpen}
                            onClose={() => setIsInviteOpen(false)}
                            type="room"
                            roomId={roomId}
                        />
                    </div>
                </div>
            </div>
            <div className="voice-chat">
                <p className="voice-chat-header">Голосовой чат</p>
                <List items={voiceMembers} mode="passive" color="dark"/>
                {jitsiToken && (
                    <button className="invite-voice-chat-btn" onClick={() => {
                        // Открыть Jitsi в iframe или новом окне
                        window.open(`https://meet.jit.si/${roomId}#config.jwt=${jitsiToken}`, "_blank");
                    }}>
                        <p>Присоединиться</p>
                    </button>
                )}
            </div>
            <div className="user-voice">
                <div className="user-voice-chat-member">
                    <img src={user.avatar}></img>
                    <p className="medium-text text--light">{user.username}</p>
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