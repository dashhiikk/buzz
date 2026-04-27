import buzzlogofull from "../../assets/buzz-logo.svg"
import '../../css/chat/chat.css'

export default function StartChatRoom({text}) {
    return (
        <>
            <div className="start-chat-content">
                <img src={buzzlogofull}></img>
                <p className="medium-text text--light">{text}</p>
            </div>
        </>
    );
}