import '../../css/menu.css'

export default function RoomMenu({ onCancel }) {
    return (
        <main>
            <div className="menu left-menu">
                <button className="beige-menu-btn">Назначить администратором</button>
                <button className="red-menu-btn">Удалить из комнаты</button>
                <button className="gray-menu-btn" onClick={onCancel}>Отмена</button>
            </div>
        </main>
    )
}