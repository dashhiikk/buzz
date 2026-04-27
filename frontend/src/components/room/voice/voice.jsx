import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../../../hooks/use-auth"

import { deleteRoom, getInviteLink, leaveRoom } from "../../../api/rooms"
import { removeFriend } from "../../../api/friends"

import CurrentVoiceUser from "./current-user"
import RoomVoiceHeader from "./voice-header/voice-header"
import VoiceChatPanel from "./voice-pannel"

import "../../../css/left-block.css"

export default function RoomVoiceChat({
    room,
    participants: initialParticipants,
    roomId,
    onParticipantsUpdate,
    voiceMembers,
    meetingError,
    hasMeetingCredentials,
    isConnecting,
    isJoined,
    onJoinVoice,
    onDisconnectVoice,
    onOpenScreenShare,
    onOpenVideoChat,
    onOpenChat,
    onOpenBoard,
    micOn,
    headphonesOn,
    demoOn,
    cameraOn,
    onToggleMicrophone,
    onToggleHeadphones,
    onToggleScreenShare,
    onToggleCamera,
}) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const isAdmin = room?.adminId === user?.id

    const [participants, setParticipants] = useState(initialParticipants)
    const [menuVisible, setMenuVisible] = useState(false)
    const [isMembersOpen, setIsMembersOpen] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [, setCopying] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState(null)

    useEffect(() => {
        setParticipants(initialParticipants)
    }, [initialParticipants])

    const handleLeave = async () => {
        try {
            await leaveRoom(roomId)
            navigate("/start")
        } catch (err) {
            console.error("Failed to leave room:", err)
        }
    }

    const handleDeleteRoom = async () => {
        if (!window.confirm("Удалить комнату?")) {
            return
        }

        try {
            await deleteRoom(roomId)
            navigate("/start")
        } catch (err) {
            console.error("Failed to delete room:", err)
        }
    }

    const handleRemoveFriend = async () => {
        try {
            const friend = participants.find((participant) => participant.id !== user.id)

            if (friend) {
                await removeFriend(friend.id)
                navigate("/start")
            }
        } catch (err) {
            console.error("Failed to remove friend:", err)
        }
    }

    const handleCopyInviteLink = async () => {
        try {
            setCopying(true)
            const response = await getInviteLink(roomId)
            await navigator.clipboard.writeText(response.data.link)
            setNotificationMessage("Ссылка скопирована!")
            window.setTimeout(() => setNotificationMessage(null), 2000)
        } catch (err) {
            console.error("Failed to get invite link:", err)
            setNotificationMessage("Не удалось скопировать ссылку")
            window.setTimeout(() => setNotificationMessage(null), 2000)
        } finally {
            setCopying(false)
        }
    }

    const handleParticipantsUpdate = (newParticipants, nextAdminId) => {
        setParticipants(newParticipants)
        onParticipantsUpdate?.(newParticipants, nextAdminId)
    }

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
                onDeleteRoom={handleDeleteRoom}
                onParticipantsUpdate={handleParticipantsUpdate}
            />

            <VoiceChatPanel
                voiceMembers={voiceMembers}
                meetingError={meetingError}
                hasMeetingCredentials={hasMeetingCredentials}
                isConnecting={isConnecting}
                isJoined={isJoined}
                onJoinVoice={onJoinVoice}
                onDisconnectVoice={onDisconnectVoice}
                onOpenScreenShare={onOpenScreenShare}
                onOpenVideoChat={onOpenVideoChat}
                onOpenChat={onOpenChat}
                onOpenBoard={onOpenBoard}
            />

            <CurrentVoiceUser
                user={user}
                isJoined={isJoined}
                micOn={micOn}
                headphonesOn={headphonesOn}
                demoOn={demoOn}
                cameraOn={cameraOn}
                onToggleMicrophone={onToggleMicrophone}
                onToggleHeadphones={onToggleHeadphones}
                onToggleScreenShare={onToggleScreenShare}
                onToggleCamera={onToggleCamera}
            />
        </main>
    )
}
