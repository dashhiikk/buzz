import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import Header from "../components/header/header"
import RoomChat from "../components/room/chat/chat"
import MiniUserVoice from "../components/room/mini-voice/mini-user-voice"
import MiniVoiceMembers from "../components/room/mini-voice/mini-voice-members"
import ScreenShare from "../components/room/screen-sharing"
import VideoChat from "../components/room/video"
import VirtualBoard from "../components/room/virtual-board"
import RoomVoiceChat from "../components/room/voice/voice"

import { useAuth } from "../hooks/use-auth"
import useJitsiMeeting from "../hooks/use-jitsi-meeting"
import usePersistedState from "../hooks/use-persisted-state"
import useSwipe from "../hooks/swipe"
import useTwoPanelLayout from "../hooks/use-two-panel-layout"

import {
    getBoardState,
    getJitsiToken,
    getMessages,
    getParticipants,
    getRoom,
} from "../api/rooms"

import "../css/page/blocks.css"
import "../css/page/layout.css"
import "../css/page/transition-btn.css"
import "../css/swipe.css"

import board from "../assets/board.svg"
import chat from "../assets/chat.svg"
import demo from "../assets/demo.svg"
import video from "../assets/video.svg"
import voice from "../assets/voice.svg"

const RIGHT_VIEW_ANIMATION_MS = 220

function isRoomUnavailableError(err) {
    const status = err?.response?.status
    const errorMessage = err?.response?.data?.error

    return (
        status === 403 ||
        status === 404 ||
        (status === 500 && errorMessage === "failed to get room")
    )
}

export default function Room() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const roomId = location.state?.roomId

    const [rightView, setRightView] = usePersistedState(
        `room:${roomId}:rightView`,
        "chat"
    )
    const [screenShareParticipantId, setScreenShareParticipantId] = useState(null)
    const isBoardView = rightView === "board"

    const layout = useTwoPanelLayout({
        defaultPane: "left",
        storageKey: `room:${roomId}`,
    })

    const effectiveIsSinglePane = layout.isSinglePane || isBoardView
    const effectiveLayoutMode = effectiveIsSinglePane ? "single" : "split"
    const effectiveActivePane = layout.activePane

    const [room, setRoom] = useState(null)
    const [participants, setParticipants] = useState([])
    const [messages, setMessages] = useState([])
    const [boardState, setBoardState] = useState(null)
    const [jitsiCredentials, setJitsiCredentials] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [displayedRightView, setDisplayedRightView] = useState(rightView)
    const [rightViewStage, setRightViewStage] = useState("entered")

    const dataFetched = useRef(false)

    const fetchData = useCallback(async () => {
        if (!roomId) {
            return
        }

        try {
            setLoading(true)

            const [
                roomRes,
                participantsRes,
                messagesRes,
                boardRes,
                jitsiRes,
            ] = await Promise.all([
                getRoom(roomId),
                getParticipants(roomId),
                getMessages(roomId, 50, 0),
                getBoardState(roomId),
                getJitsiToken(roomId),
            ])

            setRoom(roomRes.data)
            setParticipants(participantsRes.data)
            setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : [])
            setBoardState(boardRes.data)
            setJitsiCredentials(jitsiRes.data)
            setError(null)
        } catch (fetchError) {
            console.error(fetchError)

            if (isRoomUnavailableError(fetchError)) {
                navigate("/start", { replace: true })
                return
            }

            setError(fetchError.message)
        } finally {
            setLoading(false)
        }
    }, [navigate, roomId])

    useEffect(() => {
        if (!roomId) {
            navigate("/start")
            return
        }

        if (dataFetched.current) {
            return
        }

        dataFetched.current = true
        fetchData()
    }, [fetchData, navigate, roomId])

    useEffect(() => {
        if (!roomId) {
            return
        }

        const intervalId = setInterval(async () => {
            try {
                await getRoom(roomId)
            } catch (pollError) {
                if (isRoomUnavailableError(pollError)) {
                    navigate("/start", { replace: true })
                }
            }
        }, 3000)

        return () => clearInterval(intervalId)
    }, [navigate, roomId])

    const swipeHandlers = useSwipe({
        onSwipeLeft: () => {
            if (layout.isSinglePane && layout.activePane === "left") {
                layout.openPane("right")
            }
        },
        onSwipeRight: () => {
            if (layout.isSinglePane && layout.activePane === "right") {
                layout.openPane("left")
            }
        },
    })

    useEffect(() => {
        if (!effectiveIsSinglePane) {
            setDisplayedRightView(rightView)
            setRightViewStage("entered")
            return
        }

        if (rightView === displayedRightView) {
            return
        }

        let enterRafId = 0

        setRightViewStage("exiting")

        const exitTimer = setTimeout(() => {
            setDisplayedRightView(rightView)
            setRightViewStage("entering")

            enterRafId = requestAnimationFrame(() => {
                setRightViewStage("entered")
            })
        }, RIGHT_VIEW_ANIMATION_MS)

        return () => {
            clearTimeout(exitTimer)
            cancelAnimationFrame(enterRafId)
        }
    }, [displayedRightView, effectiveIsSinglePane, rightView])

    const meeting = useJitsiMeeting({
        roomId,
        credentials: jitsiCredentials,
        user,
        roomParticipants: participants,
    })

    const voiceMembers = meeting.participants
    const sharingParticipants = voiceMembers.filter(
        (participant) => participant.isScreenSharing
    )
    const activeScreenSharer =
        voiceMembers.find(
            (participant) =>
                participant.participantId === screenShareParticipantId
        ) || sharingParticipants[0] || null

    useEffect(() => {
        if (meeting.isJoined || rightView === "chat" || rightView === "board") {
            return
        }

        setRightView("chat")
        setScreenShareParticipantId(null)
    }, [meeting.isJoined, rightView, setRightView])

    useEffect(() => {
        if (rightView !== "screenShare") {
            return
        }

        if (!sharingParticipants.length) {
            setRightView("chat")
            setScreenShareParticipantId(null)
            return
        }

        const selectedParticipantExists = sharingParticipants.some(
            (participant) =>
                participant.participantId === screenShareParticipantId
        )

        if (!selectedParticipantExists) {
            setScreenShareParticipantId(sharingParticipants[0].participantId)
        }
    }, [rightView, screenShareParticipantId, setRightView, sharingParticipants])

    const handleParticipantsUpdate = (newParticipants, nextAdminId) => {
        setParticipants(newParticipants)

        if (nextAdminId) {
            setRoom((prev) => (prev ? { ...prev, adminId: nextAdminId } : prev))
            return
        }

        if (room && !newParticipants.some((participant) => participant.id === room.adminId)) {
            fetchData()
        }
    }

    const handleJoinVoice = () => {
        meeting.joinConference()
    }

    const handleDisconnectVoice = () => {
        meeting.leaveConference()
        setScreenShareParticipantId(null)

        if (rightView === "screenShare" || rightView === "videoChat") {
            setRightView("chat")
        }
    }

    const openScreenShare = (participant) => {
        const nextParticipant =
            participant ||
            voiceMembers.find(
                (voiceMember) =>
                    voiceMember.participantId === screenShareParticipantId
            ) ||
            sharingParticipants[0]

        if (!nextParticipant) {
            return
        }

        setScreenShareParticipantId(nextParticipant.participantId)
        setRightView("screenShare")

        if (layout.isSinglePane) {
            layout.openPane("right")
        }
    }

    const openChat = () => {
        setRightView("chat")

        if (layout.isSinglePane) {
            layout.openPane("right")
        }
    }

    const openVideoChat = () => {
        if (!meeting.isJoined) {
            return
        }

        setRightView("videoChat")

        if (layout.isSinglePane) {
            layout.openPane("right")
        }
    }

    const openBoard = () => {
        setRightView("board")
        layout.openPane("right")
    }

    if (loading) {
        return <div>Загрузка...</div>
    }

    if (error) {
        return <div>Ошибка: {error}</div>
    }

    if (!room) {
        return null
    }

    return (
        <main>
            <Header currentRoomId={roomId} />
            <div
                className="page"
                data-layout={effectiveLayoutMode}
                data-right-view={rightView}
                {...swipeHandlers}
            >
                <div
                    className={`panel-shell panel-shell--left ${
                        effectiveIsSinglePane
                            ? effectiveActivePane === "left"
                                ? "panel-shell--active"
                                : "panel-shell--hidden-left"
                            : "panel-shell--split"
                    }`}
                >
                    <div className="left-block">
                        {effectiveIsSinglePane && (
                            <button
                                className="to-right-switch-btn"
                                type="button"
                                onClick={() => layout.openPane("right")}
                            >
                                {rightView === "chat" && (
                                    <img src={chat} alt="Открыть чат" />
                                )}
                                {rightView === "screenShare" && (
                                    <img
                                        src={demo}
                                        alt="Открыть демонстрацию"
                                    />
                                )}
                                {rightView === "videoChat" && (
                                    <img
                                        src={video}
                                        alt="Открыть видеочат"
                                    />
                                )}
                                {rightView === "board" && (
                                    <img
                                        src={board}
                                        alt="Открыть виртуальную доску"
                                    />
                                )}
                            </button>
                        )}

                        <RoomVoiceChat
                            room={room}
                            participants={participants}
                            roomId={roomId}
                            onParticipantsUpdate={handleParticipantsUpdate}
                            voiceMembers={voiceMembers}
                            meetingError={meeting.error}
                            hasMeetingCredentials={Boolean(
                                jitsiCredentials?.token &&
                                    jitsiCredentials?.serverUrl
                            )}
                            isConnecting={meeting.isConnecting}
                            isJoined={meeting.isJoined}
                            onJoinVoice={handleJoinVoice}
                            onDisconnectVoice={handleDisconnectVoice}
                            onOpenScreenShare={openScreenShare}
                            onOpenVideoChat={openVideoChat}
                            onOpenChat={openChat}
                            onOpenBoard={openBoard}
                            micOn={meeting.micOn}
                            headphonesOn={meeting.headphonesOn}
                            demoOn={meeting.demoOn}
                            cameraOn={meeting.cameraOn}
                            onToggleMicrophone={meeting.toggleMicrophone}
                            onToggleHeadphones={meeting.toggleHeadphones}
                            onToggleScreenShare={meeting.toggleScreenShare}
                            onToggleCamera={meeting.toggleCamera}
                        />
                    </div>
                </div>

                <div
                    className={`panel-shell panel-shell--right ${
                        effectiveIsSinglePane
                            ? effectiveActivePane === "right"
                                ? "panel-shell--active"
                                : "panel-shell--hidden-right"
                            : "panel-shell--split"
                    }`}
                >
                    <div className="right-panel-stack">
                        <div className="right-block">
                            {effectiveIsSinglePane && (
                                <button
                                    className="to-left-switch-btn"
                                    type="button"
                                    onClick={() => layout.openPane("left")}
                                >
                                    <img
                                        src={voice}
                                        alt="Открыть голосовой чат"
                                    />
                                </button>
                            )}

                            {effectiveIsSinglePane && voiceMembers.length > 0 && (
                                <MiniVoiceMembers voiceMembers={voiceMembers} />
                            )}

                            <main
                                className={`right-block-content right-block-content--${rightViewStage}`}
                            >
                                {displayedRightView === "chat" && (
                                    <RoomChat
                                        roomId={roomId}
                                        initialMessages={messages}
                                        onSwitchToLeft={() => layout.openPane("left")}
                                        isSinglePane={layout.isSinglePane}
                                    />
                                )}

                                {displayedRightView === "screenShare" && (
                                    <ScreenShare
                                        onClose={openChat}
                                        sharerName={
                                            activeScreenSharer?.name ||
                                            "Пользователь"
                                        }
                                        participantVideos={voiceMembers.map(
                                            (member) => ({
                                                id: member.participantId,
                                                title: member.name,
                                                src: member.avatar,
                                            })
                                        )}
                                        attachStage={meeting.attachStage}
                                        participantId={
                                            activeScreenSharer?.participantId ||
                                            null
                                        }
                                        isJoined={meeting.isJoined}
                                    />
                                )}

                                {displayedRightView === "videoChat" && (
                                    <VideoChat
                                        attachStage={meeting.attachStage}
                                        isJoined={meeting.isJoined}
                                    />
                                )}

                                {displayedRightView === "board" && (
                                    <VirtualBoard
                                        state={boardState}
                                        onClose={openChat}
                                    />
                                )}
                            </main>
                        </div>

                        {effectiveIsSinglePane && meeting.isJoined && (
                            <MiniUserVoice
                                user={user}
                                micOn={meeting.micOn}
                                headphonesOn={meeting.headphonesOn}
                                demoOn={meeting.demoOn}
                                cameraOn={meeting.cameraOn}
                                onToggleMicrophone={meeting.toggleMicrophone}
                                onToggleHeadphones={meeting.toggleHeadphones}
                                onToggleScreenShare={meeting.toggleScreenShare}
                                onToggleCamera={meeting.toggleCamera}
                                onOpenVideoChat={openVideoChat}
                                onOpenChat={openChat}
                                onOpenBoard={openBoard}
                            />
                        )}
                    </div>
                </div>
            </div>

            {effectiveIsSinglePane && (
                <div className="swipe-dots">
                    <button
                        type="button"
                        className={`swipe-dot ${
                            layout.activePane === "left" ? "active" : ""
                        }`}
                        onClick={() => layout.openPane("left")}
                    />
                    <button
                        type="button"
                        className={`swipe-dot ${
                            layout.activePane === "right" ? "active" : ""
                        }`}
                        onClick={() => layout.openPane("right")}
                    />
                </div>
            )}
        </main>
    )
}
