import cameraOFF from "../../../assets/camera-off.svg"
import cameraON from "../../../assets/camera-on.svg"
import demoOFF from "../../../assets/demo-off.svg"
import demoON from "../../../assets/demo-on.svg"
import headOFF from "../../../assets/head-off.svg"
import headON from "../../../assets/head-on.svg"
import micOFF from "../../../assets/mic-off.svg"
import micON from "../../../assets/mic-on.svg"
import defaultAvatar from "../../../assets/user-icon.svg"

import "../../../css/voice/current-user.css"

function VoiceControlIcon({
    active,
    activeIcon,
    inactiveIcon,
    alt,
    onClick,
    disabled,
}) {
    return (
        <img
            src={active ? activeIcon : inactiveIcon}
            onClick={disabled ? undefined : onClick}
            alt={alt}
            className={disabled ? "voice-icon-disabled" : ""}
        />
    )
}

export default function CurrentVoiceUser({
    user,
    isJoined,
    micOn,
    headphonesOn,
    demoOn,
    cameraOn,
    onToggleMicrophone,
    onToggleHeadphones,
    onToggleScreenShare,
    onToggleCamera,
}) {
    return (
        <div className="user-voice">
            <div className="user-voice-chat-member">
                <img
                    src={user?.avatar || defaultAvatar}
                    alt="Аватар пользователя"
                />
                <p className="medium-text text--light">{user.username}</p>
            </div>

            <div className="voice-icons">
                <VoiceControlIcon
                    active={micOn}
                    activeIcon={micON}
                    inactiveIcon={micOFF}
                    alt="Микрофон"
                    onClick={onToggleMicrophone}
                    disabled={!isJoined}
                />
                <VoiceControlIcon
                    active={headphonesOn}
                    activeIcon={headON}
                    inactiveIcon={headOFF}
                    alt="Наушники"
                    onClick={onToggleHeadphones}
                    disabled={!isJoined}
                />
                <VoiceControlIcon
                    active={demoOn}
                    activeIcon={demoON}
                    inactiveIcon={demoOFF}
                    alt="Демонстрация экрана"
                    onClick={onToggleScreenShare}
                    disabled={!isJoined}
                />
                <VoiceControlIcon
                    active={cameraOn}
                    activeIcon={cameraON}
                    inactiveIcon={cameraOFF}
                    alt="Видео"
                    onClick={onToggleCamera}
                    disabled={!isJoined}
                />
            </div>
        </div>
    )
}
