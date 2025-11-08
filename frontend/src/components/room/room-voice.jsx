import backward from "../../assets/backward-icon.png"
import dots from "../../assets/dots-icon.png"
import room from "../../assets/room-icon.jpg"
import friend from "../../assets/friend-icon.jpg"
import user from "../../assets/user-photo.jpg"
import micON from "../../assets/microphone-on.svg"
import headON from "../../assets/headphone-on.svg"

export default function RoomVoiceChat() {
    return (
        <main className="voice-chat-block">
            <div className="left-block-header">
                <img src={backward}></img>
                <div className="left-block-header-name">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </div>
                <img src={dots}></img>
            </div>
            <div className="voice-chat">
                <p className="voice-chat-header">Голосовой чат</p>
                <ul className="voice-chat-members">
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                    <li className="voice-chat-member">
                        <img src={friend}></img>
                        <p>Ник друга</p>
                    </li>
                </ul>
                <button className="invite-voice-chat-btn"> 
                    <p>Присоединиться</p>
                </button>
            </div>
            <div className="user-voice">
                <div className="user-voice-chat-member">
                    <img src={user}></img>
                    <p>Мой ник</p>
                </div>
                <div className="voice-icons">
                    <img src={micON}></img>
                    <img src={headON}></img>
                </div>

            </div>
        </main>
    )
}