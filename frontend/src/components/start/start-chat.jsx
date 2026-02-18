import buzzlogofull from "../../assets/buzz-logo.svg"
import '../../css/chat.css'
import '../../css/right-block.css'

export default function StartChatRoom({text}) {
    return (
        <main className="right-block">
            <div className="start-chat-content">
                <img src={buzzlogofull}></img>
                <p>{text}</p>
            </div>
        </main>
    );
}