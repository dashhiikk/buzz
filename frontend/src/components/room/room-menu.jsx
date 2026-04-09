import '../../css/menu.css'

export default function RoomMenu({
    type,
    onCancel,
    onOpenMembers,
    onLeave,
    onDeleteRoom,
    onMakeAdmin,
    onRemoveFromRoom,
    onRemoveFriend,
    isAdmin,
}) {
    const config = {
        room: [
            {
                label: "Участники",
                className: "blue-menu-btn menu-btn",
                onClick: onOpenMembers,
            },
            {
                label: "Покинуть комнату",
                className: "gray-menu-btn menu-btn",
                onClick: onLeave,
            },
            ...(isAdmin
                ? [
                      {
                          label: "Удалить комнату",
                          className: "gray-menu-btn menu-btn",
                          onClick: onDeleteRoom,
                      },
                  ]
                : []),
            {
                label: "Отмена",
                className: "dark-menu-btn menu-btn",
                onClick: onCancel,
            },
        ],

        member: [
            {
                label: "Назначить администратором",
                className: "blue-menu-btn menu-btn",
                onClick: onMakeAdmin,
            },
            {
                label: "Удалить из комнаты",
                className: "gray-menu-btn menu-btn",
                onClick: onRemoveFromRoom,
            },
            {
                label: "Отмена",
                className: "dark-menu-btn menu-btn",
                onClick: onCancel,
            },
        ],

        friend: [
            {
                label: "Удалить друга и очистить чат",
                className: "gray-menu-btn menu-btn",
                onClick: onRemoveFriend,
            },
            {
                label: "Отмена",
                className: "dark-menu-btn menu-btn",
                onClick: onCancel,
            },
        ],
    };

    const buttons = config[type] || [];

    return (
        <main>
            <div className="menu left-menu">
                {buttons.map((button, index) => (
                    <button
                        key={index}
                        className={button.className}
                        onClick={button.onClick}
                    >
                        {button.label}
                    </button>
                ))}
            </div>
        </main>
    );
}
    