import { createPortal } from "react-dom";
import '../../../css/chat/pinned-message.css'
import pin from "../../../assets/pin.svg"
import MessageMenu from "./message-menu";

export default function PinnedMessage({
    pinnedMessage,
    showPinnedGradient,
    pinnedTextRef,
    pinnedMenu,
    pinnedMenuRef,
    pinnedLongPressTimer,
    pinnedLongPressTriggered,
    onOpenPinnedMenu,
    onClosePinnedMenu,
    onUnpin,
    onOpenPinnedInHistory,
}) {
    if (!pinnedMessage) return null;

    return (
        <>
            <div
                className="pinned-message"
                onClick={(e) => {
                    if (e.button !== 0) return;
                    if (pinnedLongPressTriggered.current) return;
                    onOpenPinnedInHistory();
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onOpenPinnedMenu(e);
                }}
                onTouchStart={(e) => {
                    pinnedLongPressTriggered.current = false;
                    pinnedLongPressTimer.current = setTimeout(() => {
                        pinnedLongPressTriggered.current = true;
                        onOpenPinnedMenu(e);
                    }, 500);
                }}
                onTouchEnd={() => {
                    if (pinnedLongPressTimer.current) {
                        clearTimeout(pinnedLongPressTimer.current);
                        pinnedLongPressTimer.current = null;

                        if (!pinnedLongPressTriggered.current) {
                            onOpenPinnedInHistory();
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
                        <p className="input-text text--light">
                            {pinnedMessage.text}
                        </p>
                    )}

                    {Array.isArray(pinnedMessage?.files) && pinnedMessage.files.length > 0 && (
                        <div className="pinned-files-list">
                            {pinnedMessage.files.map((file, index) => (
                                <div
                                    key={file.url || index}
                                    className="pinned-file-item input-text text--light"
                                    title={file.originalName}
                                >
                                    📎 {file.originalName || "Файл"}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showPinnedGradient && <div className="pin-gradient-overlay" />}
            </div>

            {pinnedMenu.visible &&
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
                            onClose={onClosePinnedMenu}
                            onUnpin={onUnpin}
                        />
                    </div>,
                    document.body
                )}
        </>
    );
}