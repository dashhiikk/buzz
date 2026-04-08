import '../../../css/menu.css'

import {deleteMessage} from "../../../api/rooms"

export default function UserMessageMenu({ onClose, messageId, onDelete, onPin }) {
    const handleDelete = async () => {
        try {
            await deleteMessage(messageId);
            onDelete(messageId); // уведомить родителя об удалении
            onClose();
        } catch (err) {
            console.error("Failed to delete message:", err);
            alert("Не удалось удалить сообщение");
        }
    };
    
    return (
        <main>
            <div className="menu">
                <button className="message-menu-btn" onClick={() => { /* копировать */ onClose(); }}>Копировать</button>
                <button className="message-menu-btn" onClick={() => { onPin(messageId); onClose(); }}>Закрепить</button>
                <button className="message-menu-btn" onClick={handleDelete}>Удалить</button>
            </div>
        </main>
    )
}