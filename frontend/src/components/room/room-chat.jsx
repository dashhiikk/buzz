import send from "../../assets/send.svg" 
import put from "../../assets/paperclip.svg"
import pin from "../../assets/pin.svg"

import '../../css/chat.css'
import '../../css/right-block.css'

import { useEffect, useRef, useMemo, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useWebSocket } from "../../hooks/useWebSocket";
import { getPinnedMessage, pinMessage, deleteMessage, unpinMessage } from "../../api/rooms";
import { uploadFile } from "../../api/upload";

import Messages from "./message/messages"
import MessageMenu from "./message/message-menu";

export default function RoomChat({ roomId, initialMessages = [] }) {

    const [newMessage, setNewMessage] = useState("");
    const [historyMessages, setHistoryMessages] = useState(initialMessages);
    const [pinnedMessage, setPinnedMessage] = useState(null);
    const [showPinnedGradient, setShowPinnedGradient] = useState(false);
    const pinnedTextRef = useRef(null);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);
    const pinnedLongPressTriggered = useRef(false);
    const [pinnedMenu, setPinnedMenu] = useState({
        visible: false,
        anchor: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
    });
    const pinnedMenuRef = useRef(null);
    const pinnedLongPressTimer = useRef(null);
    
    const chatRef = useRef(null);
    
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);

    const { messages: wsMessages, sendMessage } = useWebSocket(roomId, {
        onMessageDeleted: (data) => {
            setHistoryMessages(prev => prev.filter(m => m.id !== data.messageId));
            if (pinnedMessage?.id === data.messageId) {
                setPinnedMessage(null);
            }
        },
        onMessagePinned: (data) => {
            setPinnedMessage(data.message);
            setHistoryMessages(prev => prev.map(m => 
                m.id === data.messageId ? { ...m, isPinned: true } : m
            ));
        },
        onMessageUnpinned: (data) => { 
            setPinnedMessage(null); 
            setHistoryMessages(prev => prev.map(m => 
                m.id === data.messageId ? { ...m, isPinned: false } : m
            ));
        }
    });

    const allMessages = useMemo(() => [...historyMessages, ...wsMessages], [historyMessages, wsMessages]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [allMessages]);

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setUploading(true);

        try {
            const responses = await Promise.all(files.map((file) => uploadFile(file)));
            const uploadedFiles = responses.map((res) => res.data);

            console.log("uploadedFiles:", uploadedFiles);

            setAttachedFiles((prev) => [...prev, ...uploadedFiles]);
        } catch (err) {
            console.error("Failed to upload files:", err);
            alert("Не удалось загрузить файлы");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleAttachClick = () => {
        if (uploading) return;
        fileInputRef.current?.click();
    };

    const handleRemoveAttachedFile = (indexToRemove) => {
        setAttachedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSend = () => {
        if (uploading) return;

        const trimmedText = newMessage.trim();

        if (trimmedText === "" && attachedFiles.length === 0) return;

        sendMessage(trimmedText, attachedFiles);
        setNewMessage("");
        setAttachedFiles([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    const calculatePinnedMenuPosition = (clientX, clientY, menuRect) => {
        const menuWidth = menuRect?.width || 150;
        const menuHeight = menuRect?.height || 100;
        const margin = 8;
        let left = clientX - menuWidth / 2;
        let top = clientY + margin;
        if (top + menuHeight > window.innerHeight - margin) {
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

    const handleOpenPinnedMenu = (event) => {
        if (!pinnedMessage) return;
        let clientX, clientY;
        if (event.touches) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        setPinnedMenu({
            visible: true,
            anchor: { x: clientX, y: clientY },
            position: { x: clientX, y: clientY },
        });
    };

    const handleClosePinnedMenu = () => {
        setPinnedMenu(prev => ({ ...prev, visible: false }));
    };

    useLayoutEffect(() => {
        if (pinnedMenu.visible && pinnedMenuRef.current) {
            const rect = pinnedMenuRef.current.getBoundingClientRect();
            const { x, y } = calculatePinnedMenuPosition(
                pinnedMenu.anchor.x,
                pinnedMenu.anchor.y,
                rect
            );
            setPinnedMenu(prev => ({ ...prev, position: { x, y } }));
        }
    }, [pinnedMenu.visible, pinnedMenu.anchor.x, pinnedMenu.anchor.y]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pinnedMenuRef.current && !pinnedMenuRef.current.contains(event.target)) {
                handleClosePinnedMenu();
            }
        };
        if (pinnedMenu.visible) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [pinnedMenu.visible]);

    const handleDeleteMessage = async (messageId) => {
        try {
            await deleteMessage(messageId);
        } catch (err) {
            console.error("Failed to delete message:", err);
            alert("Не удалось удалить сообщение");
        }
    };

    const handlePinMessage = async (messageId) => {
        try {
            await pinMessage(roomId, messageId);
        } catch (err) {
            console.error("Failed to pin message:", err);
            alert("Не удалось закрепить сообщение");
        }
    };

    const handleUnpin = async () => {
        if (!pinnedMessage) return;
        try {
            await unpinMessage(roomId);
            handleClosePinnedMenu();
        } catch (err) {
            console.error("Failed to unpin message:", err);
            alert("Не удалось открепить сообщение");
        }
    };

    useEffect(() => {
        const fetchPinned = async () => {
            try {
                const res = await getPinnedMessage(roomId);
                setPinnedMessage(res.data);
            } catch (err) {
                console.error("Failed to get pinned message:", err);
            }
        };
        fetchPinned();
    }, [roomId]);

    const checkPinnedOverflow = () => {
        const el = pinnedTextRef.current;
        if (!el) {
            setShowPinnedGradient(false);
            return;
        }
        const hasOverflow = el.scrollHeight > el.clientHeight;
        setShowPinnedGradient(hasOverflow);
    };

    useLayoutEffect(() => {
        checkPinnedOverflow();
    }, [pinnedMessage]);

    useEffect(() => {
        window.addEventListener("resize", checkPinnedOverflow);
        return () => window.removeEventListener("resize", checkPinnedOverflow);
    }, []);

    const openPinnedMessageInHistory = () => {
        if (!pinnedMessage?.id || !chatRef.current) return;
        const messageElement = chatRef.current.querySelector(`[data-message-id="${pinnedMessage.id}"]`);
        if (!messageElement) return;
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedMessageId(pinnedMessage.id);
        setTimeout(() => setHighlightedMessageId(null), 2000);
    };

    return (
        <main className="right-block-content">
            <div className="right-block-header">
                <p className="large-text text--light">Чат</p>
            </div>

            {pinnedMessage && (
                <div
                    className="pinned-message"
                    onClick={(e) => {
                        if (e.button !== 0) return;
                        if (pinnedLongPressTriggered.current) return;
                        openPinnedMessageInHistory();
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        handleOpenPinnedMenu(e);
                    }}
                    onTouchStart={(e) => {
                        pinnedLongPressTriggered.current = false;
                        pinnedLongPressTimer.current = setTimeout(() => {
                            pinnedLongPressTriggered.current = true;
                            handleOpenPinnedMenu(e);
                        }, 500);
                    }}
                    onTouchEnd={() => {
                        if (pinnedLongPressTimer.current) {
                            clearTimeout(pinnedLongPressTimer.current);
                            pinnedLongPressTimer.current = null;
                            if (!pinnedLongPressTriggered.current) {
                                openPinnedMessageInHistory();
                            }
                        }
                    }}
                    onTouchCancel={() => {
                        if (pinnedLongPressTimer.current) {
                            clearTimeout(pinnedLongPressTimer.current);
                            pinnedLongPressTimer.current = null;
                        }
                        pinnedLongPressTriggered.current = false;
                    }}
                >
                    <img src={pin} className="pin-pinned-message" alt="pin" />
                    <div ref={pinnedTextRef} className="pinned-message-wrapper">
                        {pinnedMessage?.text && (
                            <p className="pinned-message-text input-text text--light">{pinnedMessage.text}</p>
                        )}
                        {Array.isArray(pinnedMessage?.files) && pinnedMessage.files.length > 0 && (
                            <div className="pinned-files-list">
                                {pinnedMessage.files.map((file, index) => (
                                    <div key={file.url || index} className="pinned-file-item input-text text--light" title={file.originalName}>
                                        📎 {file.originalName || "Файл"}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {showPinnedGradient && <div className="pin-gradient-overlay" />}
                </div>
            )}

            <div className="message-block-wrapper">
                <div ref={chatRef} className="message-block">
                    <Messages
                        messages={allMessages}
                        onDelete={handleDeleteMessage}
                        onPin={handlePinMessage}
                        highlightedMessageId={highlightedMessageId}
                    />
                </div>
                <div className="messages-gradient-overlay" />
            </div>

            {attachedFiles.length > 0 && (
                <div className="attached-files-preview">
                    {attachedFiles.map((file, index) => (
                        <div key={file.url || index} className="attached-file-chip">
                            <span title={file.originalName}>
                                📎 {file.originalName || "Файл"}
                            </span>
                            <button
                                type="button"
                                className="attached-file-remove"
                                onClick={() => handleRemoveAttachedFile(index)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="input-block">
                <textarea
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={uploading}
                />
                <div className="input-icons">
                    <img 
                        src={send} 
                        onClick={handleSend}
                        style={{ opacity: uploading ? 0.5 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
                        alt="send"
                    />
                    <img 
                        src={put} 
                        onClick={handleAttachClick}
                        style={{ opacity: uploading ? 0.5 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
                        alt="attach"
                    />
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                onChange={handleFileSelect}
                accept="image/*,video/*,application/pdf"
            />
            {pinnedMenu.visible && pinnedMessage &&
                createPortal(
                    <div
                        ref={pinnedMenuRef}
                        className="message-menu-portal"
                        style={{
                            position: "fixed",
                            top: pinnedMenu.position.y,
                            left: pinnedMenu.position.x,
                            zIndex: 9999,
                        }}
                    >
                        <MessageMenu
                            type="pinned"
                            messageId={pinnedMessage.id}
                            messageText={pinnedMessage.text}
                            onClose={handleClosePinnedMenu}
                            onUnpin={handleUnpin}
                        />
                    </div>,
                    document.body
                )
            }
        </main>
    );
}