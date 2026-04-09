import defaultAvatar from "../../../assets/user-icon.svg"
import fileIcon from "../../../assets/file.svg"
import MessageMenu from "./message-menu";
import {formatMessageTime} from "./date"

import '../../../css/chat.css'
import { createPortal } from 'react-dom';
import { useState, useRef, useEffect, useLayoutEffect} from 'react';
import { useAuth } from "../../../hooks/use-auth";

export default function Messages({ messages, onDelete, onPin, highlightedMessageId }) {
    const { user } = useAuth();
    const [menuState, setMenuState] = useState({
        visible: false,
        messageId: null,
        messageText: "",
        menuType: "friend",
        anchor: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
    })
    const menuRef = useRef();
    const longPressTimer = useRef(null);
    const [openedImage, setOpenedImage] = useState(null);
    const [openedVideo, setOpenedVideo] = useState(null);

    // Расчёт позиции с учётом размеров меню и границ экрана
    const calculateMenuPosition = (clientX, clientY, menuType, menuRect) => {
        const menuWidth = menuRect?.width || 150;
        const menuHeight = menuRect?.height || 100;
        const margin = 8;

        let left, top;

        const isUserMenu = menuType === "user";

        if (isUserMenu) {
            left = clientX - menuWidth - margin;
        } else {
            left = clientX + margin;
        }

        if (window.innerHeight - clientY >= menuHeight + margin) {
            top = clientY + margin;
        } else {
            top = clientY - menuHeight - margin;
        }

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
        let clientX, clientY;

        if (event.touches) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

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
        setMenuState(prev => ({ ...prev, visible: false }));
    };

    useLayoutEffect(() => {
        if (menuState.visible && menuRef.current) {
            const menuRect = menuRef.current.getBoundingClientRect();
            const { x, y } = calculateMenuPosition(
                menuState.anchor.x,
                menuState.anchor.y,
                menuState.menuType,
                menuRect
            );

            setMenuState((prev) => ({
                ...prev,
                position: { x, y },
            }));
        }
    }, [menuState.visible, menuState.anchor.x, menuState.anchor.y, menuState.menuType]);
        
    // Закрытие при клике вне меню
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

    const handleDelete = (messageId) => {
        onDelete(messageId);
    };

    const handlePin = (messageId) => {
        onPin(messageId);
    };

    // Обработчик правого клика (десктоп)
    const handleContextMenu = (event, msgId, msgText, isCurrentUser) => {
        event.preventDefault();
        handleOpenMenu(event, msgId, msgText, isCurrentUser);
    };

    // Обработчики долгого нажатия (мобильные)
    const handleTouchStart = (event, msgId, msgText, isCurrentUser) => {
        longPressTimer.current = setTimeout(() => {
            handleOpenMenu(event, msgId, msgText, isCurrentUser);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const isImageFile = (file) => {
        const name = file?.originalName?.toLowerCase() || "";
        const url = file?.url?.toLowerCase() || "";

        return (
            name.endsWith(".png") ||
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg") ||
            name.endsWith(".gif") ||
            name.endsWith(".webp") ||
            name.endsWith(".bmp") ||
            name.endsWith(".svg") ||
            url.endsWith(".png") ||
            url.endsWith(".jpg") ||
            url.endsWith(".jpeg") ||
            url.endsWith(".gif") ||
            url.endsWith(".webp") ||
            url.endsWith(".bmp") ||
            url.endsWith(".svg")
        );
    };

    const isVideoFile = (file) => {
        const name = file?.originalName?.toLowerCase() || "";
        const url = file?.url?.toLowerCase() || "";

        return (
            name.endsWith(".mp4") ||
            name.endsWith(".webm") ||
            name.endsWith(".ogg") ||
            name.endsWith(".mov") ||
            name.endsWith(".avi") ||
            name.endsWith(".mkv") ||
            url.endsWith(".mp4") ||
            url.endsWith(".webm") ||
            url.endsWith(".ogg") ||
            url.endsWith(".mov") ||
            url.endsWith(".avi") ||
            url.endsWith(".mkv")
        );
    };

    if (!Array.isArray(messages)) return null;

    return (
        <>
            {messages.map((msg) => {
                const isCurrentUser = msg.senderId === user?.id;
                const menuType = isCurrentUser ? "user" : "friend";

                const imageFiles = Array.isArray(msg.files) ? msg.files.filter(isImageFile) : [];
                const videoFiles = Array.isArray(msg.files) ? msg.files.filter(isVideoFile) : [];
                const otherFiles = Array.isArray(msg.files) ? msg.files.filter((file) => !isImageFile(file)) : [];
               
               return (
                    <div 
                        key={msg.id}
                        data-message-id={msg.id}
                        className={`${isCurrentUser ? "user-message" : "friend-message"} ${
                            highlightedMessageId === msg.id ? "message-highlighted" : ""
                        }`}
                        onContextMenu={(e) => handleContextMenu(e, msg.id, msg.text, menuType)}
                        onTouchStart={(e) => handleTouchStart(e, msg.id, msg.text, menuType)}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                    >
                        {!isCurrentUser && <img className="message-icon" src={msg.senderAvatar || defaultAvatar} alt="avatar" />}
                        <div className={`${isCurrentUser ? "user-message-content" : "friend-message-content"}`}>
                            <div className={`${isCurrentUser ? "user-message-info" : "friend-message-info"}`}>
                                {!isCurrentUser && <p className="medium-text text--average">{msg.senderUsername || "Неизвестный"}</p>}
                                {isCurrentUser && <p className="medium-text text--average">{user.username}</p>}
                                <p className="input-text text--average">{formatMessageTime(msg.createdAt)}</p>
                            </div>
                            {msg.text && (
                                <p className="input-text text--light message-text">{msg.text}</p>
                            )}

                            {imageFiles.length > 0 && (
                                <div className="message-images-list">
                                    {imageFiles.map((file, index) => (
                                        <div
                                            key={file.url || index}
                                            className="message-image-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenedImage(file);
                                            }}
                                            onContextMenu={(e) => e.stopPropagation()}
                                            title={file.originalName}
                                        >
                                            <img
                                                src={file.url}
                                                alt={file.originalName || "image"}
                                                className="message-image-preview"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {videoFiles.length > 0 && (
                                <div className="message-videos-list">
                                    {videoFiles.map((file, index) => (
                                        <div
                                            key={file.url || index}
                                            className="message-video-item"
                                            title={file.originalName}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenedVideo(file);
                                            }}
                                            onContextMenu={(e) => e.stopPropagation()}
                                        >
                                            <video
                                                className="message-video-preview"
                                                src={file.url}
                                                muted
                                                preload="metadata"
                                            />
                                            <div className="message-video-badge">▶</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {otherFiles.length > 0 && (
                                <div className="message-files-list">
                                    {otherFiles.map((file, index) => (
                                        <div
                                            key={file.url || index}
                                            className="message-file-item"
                                            onClick={(e) => e.stopPropagation()}
                                            onContextMenu={(e) => e.stopPropagation()}
                                            title={file.originalName}
                                        >
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="message-file-link input-text text--dark"
                                            >
                                                <img className="message-file-icon" src={fileIcon}/>
                                                <span className="message-file-name">
                                                    {file.originalName || "Файл"}
                                                </span>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                        </div>
                        {isCurrentUser && <img className="message-icon" src={user?.avatar || defaultAvatar} alt="avatar" />}
                    </div>
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
                        zIndex: 9999
                    }}
                >
                    <MessageMenu
                        type={menuState.menuType}
                        messageId={menuState.messageId}
                        messageText={menuState.messageText}
                        onClose={handleCloseMenu}
                        onDelete={handleDelete}
                        onPin={handlePin}
                    />
                </div>,
                document.body
            )}

            {openedImage &&
            createPortal(
                <div
                    className="image-preview-overlay"
                    onClick={() => setOpenedImage(null)}
                >
                    <div
                        className="image-preview-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={openedImage.url}
                            alt={openedImage.originalName || "image"}
                            className="image-preview-full"
                        />
                        <p className="input-text text--light image-preview-name">
                            {openedImage.originalName || "Изображение"}
                        </p>
                    </div>
                </div>,
            document.body
            )}

            {openedVideo &&
            createPortal(
                <div
                    className="video-preview-overlay"
                    onClick={() => setOpenedVideo(null)}
                >
                    <div
                        className="video-preview-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video
                            src={openedVideo.url}
                            className="video-preview-full"
                            controls
                            autoPlay
                        />
                        <p className="input-text text--light video-preview-name">
                            {openedVideo.originalName || "Видео"}
                        </p>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}