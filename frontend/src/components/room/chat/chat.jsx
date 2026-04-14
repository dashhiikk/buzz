import voice from "../../../assets/voice.svg"

import '../../../css/chat/chat.css'

import { useEffect, useRef, useMemo, useState} from "react";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { pinMessage, deleteMessage } from "../../../api/rooms";
import { uploadFile } from "../../../api/upload";

import usePinnedMessage from "../../../hooks/use-pinned-message"

import PinnedMessage from "./pinned-message"
import Messages from "./messages/messages"
import AttachedFilesPreview from "./input/attached-files-preview";
import InputMessage from "./input/input"

export default function RoomChat({ 
    roomId, 
    initialMessages = [],
    onSwitchToLeft,
    isSinglePane 
}) {

    const [newMessage, setNewMessage] = useState("");
    const [historyMessages, setHistoryMessages] = useState(initialMessages);

    const [uploading, setUploading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);

    const chatRef = useRef(null);
    const fileInputRef = useRef(null);

    const pinned = usePinnedMessage({ roomId, chatRef });

    const { messages: wsMessages, sendMessage } = useWebSocket(roomId, {
        onMessageDeleted: (data) => {
            setHistoryMessages(prev => prev.filter(m => m.id !== data.messageId));
            pinned.handleDeletedFromSocket?.(data.messageId);
        },
        onMessagePinned: (data) => {
            pinned.handlePinnedFromSocket?.(data.message);
            setHistoryMessages(prev => prev.map(m => 
                m.id === data.messageId ? { ...m, isPinned: true } : m
            ));
        },
        onMessageUnpinned: (data) => { 
            pinned.handleUnpinnedFromSocket?.(data.messageId);
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

    useEffect(() => {
        setHistoryMessages(initialMessages);
    }, [initialMessages]);

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

    return (
        <main className="right-block-content">
            {isSinglePane && (
                <button
                    className="to-left-switch-btn"
                    type="button"
                    onClick={onSwitchToLeft}
                >
                    <img src={voice} alt="Открыть голосовой чат" />
                </button>
            )}

            <div className="right-block-header">
                <p className="large-text text--light">Чат</p>
            </div>

            <PinnedMessage
                pinnedMessage={pinned.pinnedMessage}
                showPinnedGradient={pinned.showPinnedGradient}
                pinnedTextRef={pinned.pinnedTextRef}
                pinnedMenu={pinned.pinnedMenu}
                pinnedMenuRef={pinned.pinnedMenuRef}
                pinnedLongPressTimer={pinned.pinnedLongPressTimer}
                pinnedLongPressTriggered={pinned.pinnedLongPressTriggered}
                onOpenPinnedMenu={pinned.handleOpenPinnedMenu}
                onClosePinnedMenu={pinned.handleClosePinnedMenu}
                onUnpin={pinned.handleUnpin}
                onOpenPinnedInHistory={pinned.openPinnedMessageInHistory}
            />

            <div className="message-block-wrapper">
                <div ref={chatRef} className="message-block">
                    <Messages
                        messages={allMessages}
                        onDelete={handleDeleteMessage}
                        onPin={handlePinMessage}
                        highlightedMessageId={pinned.highlightedMessageId}
                    />
                </div>
                <div className="messages-gradient-overlay" />
            </div>

            <AttachedFilesPreview
                files={attachedFiles}
                onRemoveFile={handleRemoveAttachedFile}
            />

            <InputMessage
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onSend={handleSend}
                onAttachClick={handleAttachClick}
                disabled={uploading}
                fileInputRef={fileInputRef}
                onFileSelect={handleFileSelect}
            />
        </main>
    );
}