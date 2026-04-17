import RoomChat from "../components/room/chat/chat";
import RoomVoiceChat from "../components/room/voice/voice";
import Header from "../components/header/header";
import ScreenShare from "../components/room/screen-sharing";
import VideoChat from "../components/room/video";

import { useAuth } from "../hooks/use-auth";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoom, getParticipants, getMessages, getBoardState, getJitsiToken } from "../api/rooms";
 import usePersistedState from "../hooks/use-persisted-state";

import useTwoPanelLayout from "../hooks/use-two-panel-layout";
import useSwipe from "../hooks/swipe";
import MiniVoiceChatPanel from "../components/room/mini-voice-pannel";

import "../css/page/blocks.css"
import "../css/page/layout.css"
import "../css/page/transition-btn.css"
import "../css/swipe.css"

import voice from "../assets/voice.svg"
import chat from "../assets/chat.svg"
import video from "../assets/video.svg"
import demo from "../assets/demo.svg"

export default function Room () {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const roomId = location.state?.roomId;

    const [rightView, setRightView] = usePersistedState(
        `room:${roomId}:rightView`,
        "chat"
    );
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [voiceMembers, setVoiceMembers] = usePersistedState(
        `room:${roomId}:voiceMembers`,
        []
    );
    const [messages, setMessages] = useState([]);
    const [boardState, setBoardState] = useState(null);
    const [jitsiToken, setJitsiToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [micOn, setMicOn] = useState(true);
    const [headphonesOn, setHeadphonesOn] = useState(true);
    const [demoOn, setDemoOn] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);

    const dataFetched = useRef(false);

    const layout = useTwoPanelLayout({
        defaultPane: "left",
        storageKey: `room:${roomId}`
    });

    const fetchData = useCallback(async () => {
        if (!roomId) return;
        try {
            setLoading(true);
            const [roomRes, participantsRes, messagesRes, boardRes, jitsiRes] = await Promise.all([
                getRoom(roomId),
                getParticipants(roomId),
                getMessages(roomId, 50, 0),
                getBoardState(roomId),
                getJitsiToken(roomId)
            ]);
            setRoom(roomRes.data);
            setParticipants(participantsRes.data);
            setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
            setBoardState(boardRes.data);
            setJitsiToken(jitsiRes.data.token);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        if (!roomId) {
            navigate("/start");
            return;
        }
        if (dataFetched.current) return;
        dataFetched.current = true;
        fetchData();
    }, [roomId, navigate, fetchData]);
               
    const swipeHandlers = useSwipe({
        onSwipeLeft: () => {
            if (layout.isSinglePane && layout.activePane === "left") {
                layout.openPane("right");
            }
        },
        onSwipeRight: () => {
            if (layout.isSinglePane && layout.activePane === "right") {
                layout.openPane("left");
            }
        }
    });

    const handleParticipantsUpdate = (newParticipants) => {
        setParticipants(newParticipants);
        // Если изменился администратор, можно обновить комнату
        if (room && !newParticipants.some(p => p.id === room.adminId)) {
            // Перезагрузить комнату, чтобы получить нового adminId
            fetchData(); // ваша функция загрузки комнаты
        }
    };

    const handleJoinVoice = () => {
        if (!user) return;

        const currentUserVoiceItem = {
            id: user.id,
            name: user.username,
            icon: user.avatar,
        };

        setVoiceMembers((prev) => {
            const alreadyExists = prev.some((member) => member.id === user.id);
            return alreadyExists ? prev : [...prev, currentUserVoiceItem];
        });
    };

    const handleDisconnectVoice = () => {
        if (!user) return;

        setVoiceMembers((prev) =>
            prev.filter((member) => member.id !== user.id)
        );
    };

    const openScreenShare = () => {
        setRightView("screenShare");
        if (layout.isSinglePane) {
            layout.openPane("right");
        }
    };

    const openChat = () => {
        setRightView("chat");
        if (layout.isSinglePane) {
            layout.openPane("right");
        }
    };

    const openVideoChat = () => {
        setRightView("videoChat");
        if (layout.isSinglePane) {
            layout.openPane("right");
        }
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!room) return null;

    return (
        <main>
            <Header/>
            <div 
                className="page" 
                data-layout={layout.layoutMode}
                {...swipeHandlers}
            >
                <div
                    className={`panel-shell panel-shell--left ${
                        layout.isSinglePane
                            ? layout.activePane === "left"
                                ? "panel-shell--active"
                                : "panel-shell--hidden-left"
                            : "panel-shell--split"
                    }`}
                >
                    <div className="left-block">
                        {layout.isSinglePane && (
                            <button
                                className="to-right-switch-btn"
                                type="button"
                                onClick={() => layout.openPane("right")}
                            >
                                {rightView === "chat" && <img src={chat} alt="Открыть чат" />}
                                {rightView === "screenShare" && <img src={demo} alt="Открыть чат" />}
                                {rightView === "videoChat" && <img src={video} alt="Открыть чат" />}
                            </button>
                        )}
                        <RoomVoiceChat
                            room={room}
                            participants={participants}
                            jitsiToken={jitsiToken}
                            roomId={roomId}
                            onParticipantsUpdate={handleParticipantsUpdate}
                            voiceMembers={voiceMembers}
                            onJoinVoice={handleJoinVoice}
                            onDisconnectVoice={handleDisconnectVoice}
                            onOpenScreenShare={openScreenShare}
                            onOpenVideoChat={openVideoChat}
                            onOpenChat={openChat}
                            micOn={micOn}
                            setMicOn={setMicOn}
                            headphonesOn={headphonesOn}
                            setHeadphonesOn={setHeadphonesOn}
                            demoOn={demoOn}
                            setDemoOn={setDemoOn}
                            cameraOn={cameraOn}
                            setCameraOn={setCameraOn}
                        />
                    </div>
                </div>

                <div
                    className={`panel-shell panel-shell--right ${
                        layout.isSinglePane
                            ? layout.activePane === "right"
                                ? "panel-shell--active"
                                : "panel-shell--hidden-right"
                            : "panel-shell--split"
                    }`}
                >
                    <div className="right-block">
                        {layout.isSinglePane && (
                            <button
                                className="to-left-switch-btn"
                                type="button"
                                onClick={() => layout.openPane("left")}
                            >
                                <img src={voice} alt="Открыть голосовой чат" />
                            </button>
                        )}

                        {layout.isSinglePane && voiceMembers.length > 0 && (
                            <MiniVoiceChatPanel 
                                voiceMembers={participants}
                                onDisconnectVoice = {handleDisconnectVoice}
                                onOpenScreenShare = {openScreenShare}
                                onOpenVideoChat = {openVideoChat}
                                onOpenChat = {openChat}
                                micOn={micOn}
                                setMicOn={setMicOn}
                                headphonesOn={headphonesOn}
                                setHeadphonesOn={setHeadphonesOn}
                                demoOn={demoOn}
                                setDemoOn={setDemoOn}
                                cameraOn={cameraOn}
                                setCameraOn={setCameraOn}
                            />
                        )}

                        {rightView === "chat" && (
                            <RoomChat
                                roomId={roomId}
                                initialMessages={messages}
                                onSwitchToLeft={() => layout.openPane("left")}
                                isSinglePane={layout.isSinglePane}
                            />
                        )}

                        {rightView === "screenShare" && (
                            <ScreenShare onClose={openChat} />
                        )}

                        {rightView === "videoChat" && (
                            <VideoChat
                                onClose={openChat}
                                videos={participants.map((member) => ({
                                    id: member.id,
                                    title: member.username,
                                    src: member.avatar
                                }))}
                            />
                        )}
                    </div>
                </div>
            </div>

            {layout.showSwitchers && (
                <div className="swipe-dots">
                    <button
                        type="button"
                        className={`swipe-dot ${layout.activePane === "left" ? "active" : ""}`}
                        onClick={() => layout.openPane("left")}
                    />
                    <button
                        type="button"
                        className={`swipe-dot ${layout.activePane === "right" ? "active" : ""}`}
                        onClick={() => layout.openPane("right")}
                    />
                </div>
            )}
        </main>
    )
}