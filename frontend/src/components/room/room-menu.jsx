import { createPortal } from "react-dom";
import { useRef } from "react";

import useAnchoredPortalPosition from "../../hooks/use-anchored-portal-position";

import "../../css/menu.css";

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
    anchorRef,
    usePortal = false,
    contentRef,
}) {
    const fallbackRef = useRef(null);
    const menuRef = contentRef ?? fallbackRef;
    const positionStyle = useAnchoredPortalPosition({
        isOpen: usePortal,
        anchorRef,
        contentRef: menuRef,
        offset: 6,
        margin: 8,
        zIndex: 4000,
    });

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
                label: "Удалить друга",
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

    const menuContent = (
        <div
            ref={menuRef}
            style={usePortal ? positionStyle : undefined}
            className={`menu ${usePortal ? "menu--floating" : "left-menu"}`}
        >
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
    );

    if (usePortal) {
        return createPortal(menuContent, document.body);
    }

    return (
        <main>
            {menuContent}
        </main>
    );
}
