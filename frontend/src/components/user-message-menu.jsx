import '../css/menu.css'

export default function UserMessageMenu() {
    return (
        <main>
            <div className="menu user-message-menu">
                <button className="message-menu-btn">Копировать</button>
                <button className="message-menu-btn">Закрепить</button>
                <button className="message-menu-btn">Удалить</button>
            </div>
        </main>
    )
}