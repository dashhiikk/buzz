import buzzlogofull from "../../assets/buzz-logo.svg"
import '../../css/chat.css'

export default function StartChatRoom() {
    return (
        <main className="chat-block">
            <div className="start-chat-content">
                <img src={buzzlogofull}></img>
                <p>Зайдите в комнату, чтобы начать общение</p>
            </div>
        </main>
    );
}