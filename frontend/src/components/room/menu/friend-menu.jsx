import '../../../css/menu.css'

export default function FriendMenu({ onCancel, onRemoveFriend }) {
    return (
        <main>
            <div className="menu left-menu">
                <button className="red-menu-btn" onClick={onRemoveFriend}>Удалить друга и очистить чат</button>
                <button className="gray-menu-btn" onClick={onCancel}>Отмена</button>
            </div>
        </main>
    )
}