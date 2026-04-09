import '../../../css/menu.css'

export default function MessageMenu({ type, messageId, messageText, onClose, onDelete, onPin, onUnpin}) {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(messageText || "");
            onClose();
        } catch (error) {
            console.error("Не удалось скопировать сообщение:", error);
            alert("Не удалось скопировать сообщение");
        }
    };
    
    const actions = {
        copy: {
            label: "Копировать",
            onClick: handleCopy,
        },
        pin: {
            label: "Закрепить",
            onClick: () => {
                onPin?.(messageId);
                onClose();
            },
        },
        delete: {
            label: "Удалить",
            onClick: () => {
                onDelete?.(messageId);
                onClose();
            },
        },
        unpin: {
            label: "Открепить",
            onClick: () => {
                onUnpin?.();
                onClose();
            },
        },
    };

    const menuConfig = {
        user: ["copy", "pin", "delete"],
        friend: ["copy", "pin"],
        pinned: ["copy", "unpin"],
    };

    const buttons = menuConfig[type] || [];

    
    return (
        <div className="menu">
            {buttons.map((key) => (
                <button
                    key={key}
                    className="message-menu-btn"
                    onClick={actions[key].onClick}
                >
                    {actions[key].label}
                </button>
            ))}
        </div>
    );
}