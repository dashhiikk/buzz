import backward from "../../../../assets/backward.svg";
import link from "../../../../assets/link.svg";
import dots from "../../../../assets/dots.svg";
import defaultRoom from "../../../../assets/room-default.jpg";

import { Link } from "react-router-dom";
import { useRef, useEffect } from "react";

import RoomMenu from "../../room-menu";
import RoomMembers from "./members";
import SendRequest from "../../../../modals/send-request";
import Notification from "./invite-link";

export default function RoomVoiceHeader({
    room,
    isAdmin,
    user,
    participants,
    roomId,
    menuVisible,
    setMenuVisible,
    isMembersOpen,
    setIsMembersOpen,
    isInviteOpen,
    setIsInviteOpen,
    notificationMessage,
    setNotificationMessage,
    onCopyInviteLink,
    onRemoveFriend,
    onLeave,
    onParticipantsUpdate,
}) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setMenuVisible]);

    const openMembersModal = () => {
        setMenuVisible(false);
        setIsMembersOpen(true);
    };

    const openInviteModal = () => {
        setIsMembersOpen(false);
        setIsInviteOpen(true);
    };

    return (
        <div className="left-block-header">
            <Link to="/start">
                <img src={backward} className="left-block-header-btn" alt="Назад" />
            </Link>

            <div className="left-block-header-name">
                <img src={room.icon || defaultRoom} alt="Иконка комнаты" />
                <p className="medium-text text--light">{room.name}</p>
            </div>

            <div>
                {isAdmin && (
                   <div className="voice-wrapper">
                    <img
                        src={link}
                        className="left-block-header-btn"
                        onClick={onCopyInviteLink}
                        alt="Скопировать ссылку"
                    />
                    {notificationMessage && (
                        <Notification
                            message={notificationMessage}
                            onClose={() => setNotificationMessage(null)}
                        />
                    )}
                </div> 
                )}
                
                <div className="voice-wrapper" ref={menuRef}>
                    <img
                        src={dots}
                        className="left-block-header-btn"
                        alt="menu"
                        onClick={() => setMenuVisible((prev) => !prev)}
                    />

                    {menuVisible &&
                        (room.isPrivate ? (
                            <RoomMenu
                                type="friend"
                                onCancel={() => setMenuVisible(false)}
                                onRemoveFriend={onRemoveFriend}
                            />
                        ) : (
                            <RoomMenu
                                type="room"
                                isAdmin={isAdmin}
                                onCancel={() => setMenuVisible(false)}
                                onOpenMembers={openMembersModal}
                                onLeave={onLeave}
                            />
                        ))}

                    <RoomMembers
                        isOpen={isMembersOpen}
                        onClose={() => setIsMembersOpen(false)}
                        onOpenInvite={openInviteModal}
                        participants={participants}
                        roomAdminId={room.adminId}
                        isAdmin={isAdmin}
                        currentUserId={user.id}
                        roomId={roomId}
                        onParticipantsUpdate={onParticipantsUpdate}
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
    );
}