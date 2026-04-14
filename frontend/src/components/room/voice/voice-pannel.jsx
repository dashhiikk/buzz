import defaultRoom from "../../../assets/room-default.jpg";
import demo from "../../../assets/demo.svg"
import video from "../../../assets/video.svg"
import board from "../../../assets/board.svg"
import disconnect from "../../../assets/disconnect.svg"

import List from "../../list";
import "../../../css/voice/voice-pannel.css"

import { useMemo, useState } from "react";
import { useAuth } from "../../../hooks/use-auth";

export default function VoiceChatPanel({
    participants = [],
    jitsiToken
}) {
    const { user } = useAuth();
    const [isJoined, setIsJoined] = useState(false);

    const voiceMembers = useMemo(() => {
        if (!isJoined || !user) return [];

        const normalizedParticipants = participants.map((p) => ({
            id: p.id,
            name: p.username,
            icon: p.avatar || defaultRoom,
        }));

        const currentUserItem = {
            id: user.id,
            name: user.username,
            icon: user.avatar || defaultRoom,
        };

        const alreadyExists = normalizedParticipants.some(
            (member) => member.id === user.id
        );

        return alreadyExists
            ? normalizedParticipants
            : [...normalizedParticipants, currentUserItem];
    }, [isJoined, participants, user]);

    const handleJoin = () => {
        setIsJoined(true);
    };

    const handleDisconnect = () => {
        setIsJoined(false);
    };

    return (
        <div className="voice-chat">
            <p className="voice-chat-header">Голосовой чат</p>
            {isJoined && (
                <button
                    type="button"
                    className="disconnect-btn"
                    onClick={handleDisconnect}
                >
                    <img src={disconnect} alt="Отключиться" />
                </button>
            )}
            <List items={voiceMembers} mode="passive" color="dark" />
            <div className="voice-chat-control"> 
                {!isJoined && jitsiToken && (
                    <button
                        type="button"
                        className="join-btn"
                        onClick={handleJoin}
                    >
                        <p>Присоединиться</p>
                    </button>
                )}
                {isJoined && (
                    <div className="voice-chat-btns">
                        <button type="button">
                            <img src={demo} alt="Демонстрация" />
                        </button>
                        <button type="button">
                            <img src={video} alt="Видео" />
                        </button>
                        <button type="button">
                            <img src={board} alt="Доска" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}