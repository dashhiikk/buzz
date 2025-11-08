import friend from "../../assets/friend-icon.jpg"
import user from "../../assets/user-photo.jpg"
import send from "../../assets/send-icon.svg" 
import put from "../../assets/paperclip-icon.svg"
import '../../css/chat.css'

export default function RoomChat() {
    return (
        <main className="chat-block">
            <div className="chat-header">
                <p>Чат</p>
            </div>
            <div className="message-block">
                <div className="friend-message">
                    <img src={friend}></img>
                    <div>
                        <p className="message-name">Ник друга</p>
                        <p className="message-text">Текст сообщения</p>
                    </div>
                </div>
                <div className="user-message">
                    <div>
                        <p className="message-name">Мой ник</p>
                        <p className="message-text">Текст сообщения</p>
                    </div> 
                    <img src={user}></img>
                </div>
            </div>
            <div>
                <div>
                    <p>Введите сообщение</p>
                </div>
                <div>
                    <img src={send}></img>
                    <img src={put}></img>
                </div>
            </div>
        </main>
    );
}