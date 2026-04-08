import '../../../css/menu.css'

export default function FriendMessageMenu({ onClose, messageId, onPin }) {
    return (
        <main>
            <div className="menu">
                <button className="message-menu-btn" onClick={() => { /* копировать */ onClose(); }}>Копировать</button>
                <button className="message-menu-btn" onClick={() => { onPin(messageId); onClose(); }}>Закрепить</button>
            </div>
        </main>
    )
}