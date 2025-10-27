import buzzlogofull from "../../assets/buzz-logo-full.png"

export default function StartChatFriend() {
    return (
        <main className="start-chat-block">
            <div className="start-chat-content">
                <img src={buzzlogofull}></img>
                <p>Выберите друга, чтобы начать общение</p>
            </div>
        </main>
    );
}