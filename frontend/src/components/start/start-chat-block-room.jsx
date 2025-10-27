import buzzlogofull from "../../assets/buzz-logo-full.png"

export default function StartChatRoom() {
    return (
        <main className="start-chat-block">
            <div className="start-chat-content">
                <img src={buzzlogofull}></img>
                <p>Зайдите в комнату, чтобы начать общение</p>
            </div>
        </main>
    );
}