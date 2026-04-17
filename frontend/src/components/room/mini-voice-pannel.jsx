import { useEffect, useRef, useState } from "react";
import defaultAvatar from "../../assets/user-icon.svg"
import "../../css/voice/mini-voice-pannel.css"

import chat from "../../assets/chat.svg"
import video from "../../assets/video.svg"
import board from "../../assets/board.svg"
import disconnect from "../../assets/disconnect.svg"

export default function MiniVoiceChatPanel({
    voiceMembers = [],
    onDisconnectVoice,
    onOpenScreenShare,
    onOpenVideoChat,
    onOpenChat
}) {
    const listRef = useRef(null);
    const [showBottomGradient, setShowBottomGradient] = useState(false);

    useEffect(() => {
        const listEl = listRef.current;
        if (!listEl) return;

        const updateGradient = () => {
            const hasOverflow = listEl.scrollHeight > listEl.clientHeight;
            const isAtBottom =
                listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 1;

            setShowBottomGradient(hasOverflow && !isAtBottom);
        };

        updateGradient();

        listEl.addEventListener("scroll", updateGradient);
        window.addEventListener("resize", updateGradient);

        const resizeObserver = new ResizeObserver(updateGradient);
        resizeObserver.observe(listEl);

        return () => {
            listEl.removeEventListener("scroll", updateGradient);
            window.removeEventListener("resize", updateGradient);
            resizeObserver.disconnect();
        };
    }, [voiceMembers]);

    return (
        <div className="mini-voice-pannel">
            <div className="mini-voice-members">
                <div className={`mini-voice-members-wrapper ${showBottomGradient ? "has-bottom-gradient" : ""}`}>
                    <ul ref={listRef} className="mini-voice-members-list">
                        {voiceMembers.map((item) => (
                            <li key={item.id} className="mini-voice-members-list-element">
                            <img src={item.avatar || defaultAvatar} alt="" />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="mini-voice-btns">
                <button type="button" onClick={onOpenChat}> 
                    <img src={chat} alt="Демонстрация" />
                </button>
                <button type="button" onClick={onOpenVideoChat}>
                    <img src={video} alt="Видео" />
                </button>
                <button type="button">
                    <img src={board} alt="Доска" />
                </button>
                <button type="button" onClick={onDisconnectVoice}>
                    <img src={disconnect} alt="Отключиться" />
                </button>            
            </div>
        </div>
    );
}