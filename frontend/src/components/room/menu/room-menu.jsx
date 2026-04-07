import '../../../css/menu.css'

export default function RoomMenu({ onCancel, onOpenMembers, onLeave }) {

    return (
        <main>
            <div className="menu left-menu">
                <button className="beige-menu-btn" onClick={onOpenMembers}>
                    Участники
                </button>
                <button className="red-menu-btn" onClick={onLeave}>Покинуть комнату</button>
                <button className="gray-menu-btn" onClick={onCancel}>Отмена</button>
            </div>
        </main>
    )
}