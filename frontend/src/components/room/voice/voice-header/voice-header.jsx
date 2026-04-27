import backward from "../../../../assets/backward.svg";
import link from "../../../../assets/link.svg";
import dots from "../../../../assets/dots.svg";
import defaultRoom from "../../../../assets/room-default.jpg";

import { Link } from "react-router-dom";
import { useRef, useEffect } from "react";

import RoomMenu from "../../room-menu";
import RoomMembers from "./members";
import SendRequest from "../../../../modals/send-request";
import NotificationToast from "../../../notification";

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
    onDeleteRoom,
    onParticipantsUpdate,
}) {
    const copyTriggerRef = useRef(null);
    const menuTriggerRef = useRef(null);
    const menuContentRef = useRef(null);

    useEffect(() => {
        if (!menuVisible) {
            return;
        }

        const handleClickOutside = (event) => {
            const clickedTrigger =
                menuTriggerRef.current &&
                menuTriggerRef.current.contains(event.target);
            const clickedMenu =
                menuContentRef.current &&
                menuContentRef.current.contains(event.target);

            if (!clickedTrigger && !clickedMenu) {
                setMenuVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuVisible, setMenuVisible]);

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
                <img src={backward} className="left-block-header-btn" alt="РќР°Р·Р°Рґ" />
            </Link>

            <div className="left-block-header-name">
                <img src={room.icon || defaultRoom} alt="РРєРѕРЅРєР° РєРѕРјРЅР°С‚С‹" />
                <p className="medium-text text--light">{room.name}</p>
            </div>

            <div>
                {isAdmin && (
                    <div className="voice-wrapper">
                        <img
                            ref={copyTriggerRef}
                            src={link}
                            className="left-block-header-btn"
                            onClick={onCopyInviteLink}
                            alt="РЎРєРѕРїРёСЂРѕРІР°С‚СЊ СЃСЃС‹Р»РєСѓ"
                        />
                        {notificationMessage && (
                            <NotificationToast
                                message={notificationMessage}
                                anchorRef={copyTriggerRef}
                                usePortal
                                onClose={() => setNotificationMessage(null)}
                            />
                        )}
                    </div>
                )}

                <div className="voice-wrapper">
                    <img
                        ref={menuTriggerRef}
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
                                anchorRef={menuTriggerRef}
                                usePortal
                                contentRef={menuContentRef}
                            />
                        ) : (
                            <RoomMenu
                                type="room"
                                isAdmin={isAdmin}
                                onCancel={() => setMenuVisible(false)}
                                onOpenMembers={openMembersModal}
                                onLeave={onLeave}
                                onDeleteRoom={onDeleteRoom}
                                anchorRef={menuTriggerRef}
                                usePortal
                                contentRef={menuContentRef}
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
