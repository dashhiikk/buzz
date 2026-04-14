import MessageAttachments from "./attachments";

export default function MessageItem({
    msg,
    user,
    defaultAvatar,
    isCurrentUser,
    isHighlighted,
    formattedTime,
    onContextMenu,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    onOpenImage,
    onOpenVideo,
}) {
    return (
        <div
            data-message-id={msg.id}
            className={`${isCurrentUser ? "user-message" : "friend-message"} ${
                isHighlighted ? "message-highlighted" : ""
            }`}
            onContextMenu={onContextMenu}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchCancel}
        >
            {!isCurrentUser && (
                <img
                    className="message-icon"
                    src={msg.senderAvatar || defaultAvatar}
                    alt="avatar"
                />
            )}

            <div className={isCurrentUser ? "user-message-content" : "friend-message-content"}>
                <div className={isCurrentUser ? "user-message-info" : "friend-message-info"}>
                    <p className="medium-text text--average">
                        {isCurrentUser ? user?.username : msg.senderUsername || "Неизвестный"}
                    </p>
                    <p className="input-text text--average">{formattedTime}</p>
                </div>

                {msg.text && (
                    <p className="input-text text--light message-text">{msg.text}</p>
                )}

                <MessageAttachments
                    files={msg.files}
                    onOpenImage={onOpenImage}
                    onOpenVideo={onOpenVideo}
                />
            </div>

            {isCurrentUser && (
                <img
                    className="message-icon"
                    src={user?.avatar || defaultAvatar}
                    alt="avatar"
                />
            )}
        </div>
    );
}