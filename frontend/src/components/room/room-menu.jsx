import '../../css/menu.css'

export default function RoomMenu({ onCancel }) {
    return (
        <main>
            <div className="menu left-menu">
                <button className="red-menu-btn">Покинуть комнату</button>
                <button className="gray-menu-btn" onClick={onCancel}>Отмена</button>
            </div>
        </main>
    )
}