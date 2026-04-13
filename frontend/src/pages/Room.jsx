import RoomChat from "../components/room/room-chat";
import RoomVoiceChat from "../components/room/room-voice";
import Header from "../components/header/header";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoom, getParticipants, getMessages, getBoardState, getJitsiToken } from "../api/rooms";

import useTwoPanelLayout from "../hooks/use-two-panel-layout";
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

    const dataFetched = useRef(false);

    const layout = useTwoPanelLayout({
        defaultPane: "left" // left = voice, right = chat
        
    });
    console.log("layout:", layout);
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


    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!room) return null;



    return (
        <main>
            <Header/>

            <div className="page" data-layout={layout.layoutMode} {...swipeHandlers}>
                {layout.showPane("left") && (
                    <div className={`left-block ${layout.showPane("left") ? "" : "panel-hidden"}`}>
                        <RoomVoiceChat
                            room={room}
                            participants={participants}
                            jitsiToken={jitsiToken}
                            roomId={roomId}
                            onParticipantsUpdate={handleParticipantsUpdate}
                        />
                    </div>
                )}
                
                {layout.showPane("right") && (
                    <div className={`right-block ${layout.showPane("right") ? "" : "panel-hidden"}`}>
                        <RoomChat
                            roomId={roomId}
                            initialMessages={messages}
                        />
                    </div>
                )} 
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