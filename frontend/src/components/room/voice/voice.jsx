import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth } from "../../../hooks/use-auth";
import { useRoomAdmin } from "../../../hooks/useRoomAdmin";

import { leaveRoom, getInviteLink } from "../../../api/rooms";
import { removeFriend } from "../../../api/friends";

import RoomVoiceHeader from "./voice-header/voice-header";
import VoiceChatPanel from "./voice-pannel";
import CurrentVoiceUser from "./current-user";

import "../../../css/left-block.css";

export default function RoomVoiceChat({
    room,
    participants: initialParticipants,
    jitsiToken,
    roomId,
    onParticipantsUpdate,
    voiceMembers,
    onJoinVoice,
    onDisconnectVoice,
    onOpenScreenShare,
    onOpenVideoChat,
    onOpenChat,
    micOn,
    setMicOn,
    headphonesOn,
    setHeadphonesOn,
    demoOn,
    setDemoOn,
    cameraOn,
    setCameraOn,
}) {
    const { user } = useAuth();
    const { isAdmin } = useRoomAdmin(roomId);
    const navigate = useNavigate();

    const [participants, setParticipants] = useState(initialParticipants);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const [, setCopying] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(null);

    useEffect(() => {
        setParticipants(initialParticipants);
    }, [initialParticipants]);

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
            const friend = participants.find((p) => p.id !== user.id);

            if (friend) {
                await removeFriend(friend.id);
                navigate("/start");
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
        onParticipantsUpdate?.(newParticipants);
    };

    return (
        <main className="left-block-content">
            <RoomVoiceHeader
                room={room}
                isAdmin={isAdmin}
                user={user}
                participants={participants}
                roomId={roomId}
                menuVisible={menuVisible}
                setMenuVisible={setMenuVisible}
                isMembersOpen={isMembersOpen}
                setIsMembersOpen={setIsMembersOpen}
                isInviteOpen={isInviteOpen}
                setIsInviteOpen={setIsInviteOpen}
                notificationMessage={notificationMessage}
                setNotificationMessage={setNotificationMessage}
                onCopyInviteLink={handleCopyInviteLink}
                onRemoveFriend={handleRemoveFriend}
                onLeave={handleLeave}
                onParticipantsUpdate={handleParticipantsUpdate}
            />

            <VoiceChatPanel
                voiceMembers={voiceMembers}
                demoOn = {demoOn}
                jitsiToken={jitsiToken}
                onJoinVoice={onJoinVoice}
                onDisconnectVoice={onDisconnectVoice}
                onOpenScreenShare={onOpenScreenShare}
                onOpenVideoChat = {onOpenVideoChat}
                onOpenChat ={onOpenChat}
            />

            <CurrentVoiceUser
                user={user}
                micOn={micOn}
                setMicOn={setMicOn}
                headphonesOn={headphonesOn}
                setHeadphonesOn={setHeadphonesOn}
                demoOn={demoOn}
                setDemoOn={setDemoOn}
                cameraOn={cameraOn}
                setCameraOn={setCameraOn}
            />
        </main>
    );
}