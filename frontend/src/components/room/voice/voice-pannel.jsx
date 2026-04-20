import chat from "../../../assets/chat.svg"
import video from "../../../assets/video.svg"
import board from "../../../assets/board.svg"
import disconnect from "../../../assets/disconnect.svg"

import VoiceChatMembers from "./voice-chat-members"
import "../../../css/voice/voice-pannel.css"

export default function VoiceChatPanel({
    voiceMembers,
    demoOn,
    jitsiToken,
    isJoined,
    onJoinVoice,
    onDisconnectVoice,
    onOpenScreenShare,
    onOpenVideoChat,
    onOpenChat,
    onOpenBoard
}) {

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
                demoOn = {demoOn}
                onOpenScreenShare = {onOpenScreenShare}
            />
            <div className="voice-chat-control"> 
                {!isJoined && jitsiToken && (
                    <button
                        type="button"
                        className="join-btn"
                        onClick={onJoinVoice}
                    >
                        <p>Присоединиться</p>
                    </button>
                )}
                {isJoined && (
                    <div className="voice-chat-btns">
                        <button type="button" onClick={onOpenChat}> 
                            <img src={chat} alt="Демонстрация" />
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
        </div>
    );
}