import defaultAvatar from "../../../../assets/user-icon.svg";
import { createPortal } from "react-dom";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useAuth } from "../../../../hooks/use-auth";

import MessageMenu from "./menu";
import MessageItem from "./item";
import MediaPreviewPortal from "./media-preview-portal";
import { formatMessageTime } from "./date";

import '../../../../css/chat/message.css'

export default function Messages({ messages, onDelete, onPin, highlightedMessageId }) {
    const { user } = useAuth();

    const [menuState, setMenuState] = useState({
        visible: false,
        messageId: null,
        messageText: "",
        menuType: "friend",
        anchor: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
    });

    const [openedImage, setOpenedImage] = useState(null);
    const [openedVideo, setOpenedVideo] = useState(null);

    const menuRef = useRef(null);
    const longPressTimer = useRef(null);

    const calculateMenuPosition = (clientX, clientY, menuType, menuRect) => {
        const menuWidth = menuRect?.width || 150;
        const menuHeight = menuRect?.height || 100;
        const margin = 8;

        let left = menuType === "user"
            ? clientX - menuWidth - margin
            : clientX + margin;

        let top =
            window.innerHeight - clientY >= menuHeight + margin
                ? clientY + margin
                : clientY - menuHeight - margin;

        if (left < margin) left = margin;
        if (left + menuWidth > window.innerWidth - margin) {
            left = window.innerWidth - menuWidth - margin;
        }
        if (top < margin) top = margin;
        if (top + menuHeight > window.innerHeight - margin) {
            top = window.innerHeight - menuHeight - margin;
        }

        return { x: left, y: top };
    };

    const handleOpenMenu = (event, msgId, msgText, menuType) => {
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;

        setMenuState((prev) => {
            if (prev.visible && prev.messageId === msgId) {
                return { ...prev, visible: false };
            }

            return {
                visible: true,
                messageId: msgId,
                messageText: msgText,
                menuType,
                anchor: { x: clientX, y: clientY },
                position: { x: clientX, y: clientY },
            };
        });
    };

    const handleCloseMenu = () => {
        setMenuState((prev) => ({ ...prev, visible: false }));
    };

    useLayoutEffect(() => {
        if (menuState.visible && menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const { x, y } = calculateMenuPosition(
                menuState.anchor.x,
                menuState.anchor.y,
                menuState.menuType,
                rect
            );

            setMenuState((prev) => ({
                ...prev,
                position: { x, y },
            }));
        }
    }, [menuState.visible, menuState.anchor.x, menuState.anchor.y, menuState.menuType]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                handleCloseMenu();
            }
        };

        if (menuState.visible) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [menuState.visible]);

    const handleTouchStart = (event, msgId, msgText, menuType) => {
        longPressTimer.current = setTimeout(() => {
            handleOpenMenu(event, msgId, msgText, menuType);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    if (!Array.isArray(messages)) return null;

    return (
        <>
            {messages.map((msg) => {
                const isCurrentUser = msg.senderId === user?.id;
                const menuType = isCurrentUser ? "user" : "friend";

                return (
                    <MessageItem
                        key={msg.id}
                        msg={msg}
                        user={user}
                        defaultAvatar={defaultAvatar}
                        isCurrentUser={isCurrentUser}
                        isHighlighted={highlightedMessageId === msg.id}
                        formattedTime={formatMessageTime(msg.createdAt)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            handleOpenMenu(e, msg.id, msg.text, menuType);
                        }}
                        onTouchStart={(e) => handleTouchStart(e, msg.id, msg.text, menuType)}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                        onOpenImage={setOpenedImage}
                        onOpenVideo={setOpenedVideo}
                    />
                );
            })}

            {menuState.visible &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="message-menu-portal"
                        style={{
                            position: "fixed",
                            top: menuState.position.y,
                            left: menuState.position.x,
                            zIndex: 9999,
                        }}
                    >
                        <MessageMenu
                            type={menuState.menuType}
                            messageId={menuState.messageId}
                            messageText={menuState.messageText}
                            onClose={handleCloseMenu}
                            onDelete={onDelete}
                            onPin={onPin}
                        />
                    </div>,
                    document.body
                )}

            <MediaPreviewPortal
                openedImage={openedImage}
                openedVideo={openedVideo}
                onCloseImage={() => setOpenedImage(null)}
                onCloseVideo={() => setOpenedVideo(null)}
            />
        </>
    );
}