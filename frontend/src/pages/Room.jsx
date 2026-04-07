import RoomChat from "../components/room/room-chat";
import RoomVoiceChat from "../components/room/room-voice";
import Header from "../components/header/header";

import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoom, getParticipants, getMessages, getBoardState, getJitsiToken } from "../api/rooms";

import useIsPortrait from "../hooks/is-portrait";
import useSwipe from "../hooks/swipe";

import "../css/swipe.css"

export default function Room () {
    const location = useLocation();
    const navigate = useNavigate();
    const roomId = location.state?.roomId;

    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [boardState, setBoardState] = useState(null);
    const [jitsiToken, setJitsiToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isPortrait = useIsPortrait();
    const [mobileView, setMobileView] = useState("voice");

    const dataFetched = useRef(false);

    useEffect(() => {
        
        if (!roomId) {
            navigate("/start");
            return;
        }
        if (dataFetched.current) return;
        dataFetched.current = true;

        const fetchData = async () => {
            try {
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
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [roomId, navigate]);

    const swipeHandlers = useSwipe({
        onSwipeLeft: () => {
            if (isPortrait && mobileView === "voice") setMobileView("chat");
        },
        onSwipeRight: () => {
            if (isPortrait && mobileView === "chat") setMobileView("voice");
        }
    });

    useEffect(() => {
        if (isPortrait) {
            setMobileView("voice");
        }
    }, [isPortrait]);


    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!room) return null;

    return (
        <main>
            <Header/>
            <div className="page" {...swipeHandlers}>
                {(!isPortrait || mobileView === "voice") && (
                    <RoomVoiceChat
                        room={room}
                        participants={participants}
                        jitsiToken={jitsiToken}
                        roomId={roomId}
                    />
                )}
                
                { (!isPortrait || mobileView === "chat") && (
                    <RoomChat
                        roomId={roomId}
                        initialMessages={messages}
                    />
                ) }
                
            </div>
            {isPortrait && (
                <div className="swipe-dots">
                    <span className={`swipe-dot ${mobileView === "voice" ? "active" : ""}`}/>
                    <span className={`swipe-dot ${mobileView === "chat" ? "active" : ""}`}/>
                </div>
            )}
        </main>
    )
}