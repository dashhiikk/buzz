import board from "../../../assets/board.svg"
import cameraOFF from "../../../assets/camera-off.svg"
import cameraON from "../../../assets/camera-on.svg"
import chat from "../../../assets/chat.svg"
import demoOFF from "../../../assets/demo-off.svg"
import demoON from "../../../assets/demo-on.svg"
import headOFF from "../../../assets/head-off.svg"
import headON from "../../../assets/head-on.svg"
import micOFF from "../../../assets/mic-off.svg"
import micON from "../../../assets/mic-on.svg"
import defaultAvatar from "../../../assets/user-icon.svg"
import video from "../../../assets/video.svg"

import "../../../css/voice/current-user.css"
import "../../../css/voice/mini-voice.css"

function VoiceControlIcon({
    active,
    activeIcon,
    inactiveIcon,
    alt,
    onClick,
}) {
    return (
        <img
            src={active ? activeIcon : inactiveIcon}
            onClick={onClick}
            alt={alt}
        />
    )
}

export default function MiniUserVoice({
    user,
    micOn,
    headphonesOn,
    demoOn,
    cameraOn,
    onToggleMicrophone,
    onToggleHeadphones,
    onToggleScreenShare,
    onToggleCamera,
    onOpenVideoChat,
    onOpenChat,
    onOpenBoard,
}) {
    return (
        <div className="mini-voice-user-panel">
            <div className="mini-voice-user">
                <div className="mini-user-voice-chat-member">
                    <img
                        src={user?.avatar || defaultAvatar}
                        alt="Аватар пользователя"
                    />
                    <p className="medium-text text--light">{user.username}</p>
                </div>

                <div className="mini-voice-icons">
                    <VoiceControlIcon
                        active={micOn}
                        activeIcon={micON}
                        inactiveIcon={micOFF}
                        alt="Микрофон"
                        onClick={onToggleMicrophone}
                    />
                    <VoiceControlIcon
                        active={headphonesOn}
                        activeIcon={headON}
                        inactiveIcon={headOFF}
                        alt="Наушники"
                        onClick={onToggleHeadphones}
                    />
                    <VoiceControlIcon
                        active={demoOn}
                        activeIcon={demoON}
                        inactiveIcon={demoOFF}
                        alt="Демонстрация экрана"
                        onClick={onToggleScreenShare}
                    />
                    <VoiceControlIcon
                        active={cameraOn}
                        activeIcon={cameraON}
                        inactiveIcon={cameraOFF}
                        alt="Видео"
                        onClick={onToggleCamera}
                    />
                </div>
            </div>

            <div className="mini-voice-btns">
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
        </div>
    )
}
