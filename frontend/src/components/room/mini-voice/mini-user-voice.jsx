import defaultAvatar from "../../../assets/user-icon.svg"

import "../../../css/voice/mini-voice.css"
import "../../../css/voice/current-user.css"

import micON from "../../../assets/mic-on.svg";
import headON from "../../../assets/head-on.svg";
import micOFF from "../../../assets/mic-off.svg";
import headOFF from "../../../assets/head-off.svg";
import demoON from "../../../assets/demo-on.svg"
import demoOFF from "../../../assets/demo-off.svg"
import cameraON from "../../../assets/camera-on.svg"
import cameraOFF from "../../../assets/camera-off.svg"

import chat from "../../../assets/chat.svg"
import video from "../../../assets/video.svg"
import board from "../../../assets/board.svg"

export default function MiniUserVoice({
    user,
    micOn,
    setMicOn,
    headphonesOn,
    setHeadphonesOn,
    demoOn,
    setDemoOn,
    cameraOn,
    setCameraOn,
    onOpenVideoChat,
    onOpenChat,
    onOpenBoard
}) {

    return (
        <div className="mini-voice-user-panel">
            <div className="mini-voice-user">
                <div className="mini-user-voice-chat-member">
                    <img src={user?.avatar || defaultAvatar } alt="Аватар пользователя" />
                    <p className="medium-text text--light">{user.username}</p>
                </div>
    
                <div className="mini-voice-icons">
                    <img
                        src={micOn ? micON : micOFF}
                        onClick={() => setMicOn((prev) => !prev)}
                        alt="Микрофон"
                    />
                    <img
                        src={headphonesOn ? headON : headOFF}
                        onClick={() => setHeadphonesOn((prev) => !prev)}
                        alt="Наушники"
                    />
                    <img
                        src={demoOn ? demoON : demoOFF}
                        onClick={() => setDemoOn((prev) => !prev)}
                        alt="Демонстрация экрана"
                    />
                    <img
                        src={cameraOn ? cameraON : cameraOFF}
                        onClick={() => setCameraOn((prev) => !prev)}
                        alt="Видео"
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
    );
}