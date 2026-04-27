import board from "../../../assets/board.svg"
import chat from "../../../assets/chat.svg"
import disconnect from "../../../assets/disconnect.svg"
import video from "../../../assets/video.svg"

import VoiceChatMembers from "./voice-chat-members"

import "../../../css/voice/voice-pannel.css"

export default function VoiceChatPanel({
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
}) {
    const canJoinVoice = hasMeetingCredentials && !isConnecting

    return (
        <div className="voice-chat">
            <p className="voice-chat-header">Голосовой чат</p>

            {isJoined && (
                <button
                    type="button"
                    className="disconnect-btn"
                    onClick={onDisconnectVoice}
                >
                    <img src={disconnect} alt="Отключиться" />
                </button>
            )}

            <VoiceChatMembers
                items={voiceMembers}
                onOpenScreenShare={onOpenScreenShare}
            />

            <div className="voice-chat-control">
                {!isJoined && (
                    <button
                        type="button"
                        className="join-btn"
                        onClick={onJoinVoice}
                        disabled={!canJoinVoice}
                    >
                        <p>
                            {isConnecting
                                ? "Подключение..."
                                : hasMeetingCredentials
                                  ? "Присоединиться"
                                  : "Jitsi недоступен"}
                        </p>
                    </button>
                )}

                {isJoined && (
                    <div className="voice-chat-btns">
                        <button type="button" onClick={onOpenChat}>
                            <img src={chat} alt="Чат" />
                        </button>
                        <button type="button" onClick={onOpenVideoChat}>
                            <img src={video} alt="Видео" />
                        </button>
                        <button type="button" onClick={onOpenBoard}>
                            <img src={board} alt="Доска" />
                        </button>
                    </div>
                )}
            </div>

            {meetingError && (
                <p className="voice-chat-error">{meetingError}</p>
            )}
        </div>
    )
}
