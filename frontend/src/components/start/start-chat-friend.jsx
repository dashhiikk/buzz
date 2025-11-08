import buzzlogofull from "../../assets/buzz-logo.svg"
import '../../css/chat.css'

export default function StartChatFriend() {
    return (
        <main className="chat-block">
            <div className="start-chat-content">
                <img src={buzzlogofull}></img>
                <p>Выберите друга, чтобы начать общение</p>
            </div>
        </main>
    );
}