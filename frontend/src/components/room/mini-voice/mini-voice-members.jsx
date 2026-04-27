import { useLayoutEffect, useRef, useState } from "react";
import defaultAvatar from "../../../assets/user-icon.svg"
import "../../../css/voice/mini-voice.css"

export default function MiniVoiceMembers({
    voiceMembers = []
}) {
    const listRef = useRef(null);
    const [showBottomGradient, setShowBottomGradient] = useState(false);

    useLayoutEffect(() => {
        const listEl = listRef.current;
        if (!listEl) return;

        let rafId = 0;

        const updateGradient = () => {
            const maxScrollTop = listEl.scrollHeight - listEl.clientHeight;
            const hasOverflow = maxScrollTop > 1;
            const canScrollDown = listEl.scrollTop < maxScrollTop - 1;

            setShowBottomGradient(hasOverflow && canScrollDown);
        };

        const scheduleUpdate = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateGradient);
        };

        scheduleUpdate();

        listEl.addEventListener("scroll", updateGradient);
        window.addEventListener("resize", scheduleUpdate);

        const resizeObserver = new ResizeObserver(scheduleUpdate);
        resizeObserver.observe(listEl);

        const images = listEl.querySelectorAll("img");
        images.forEach((img) => {
            if (!img.complete) {
                img.addEventListener("load", scheduleUpdate);
            }
        });

        return () => {
            cancelAnimationFrame(rafId);
            listEl.removeEventListener("scroll", updateGradient);
            window.removeEventListener("resize", scheduleUpdate);
            resizeObserver.disconnect();

            images.forEach((img) => {
                img.removeEventListener("load", scheduleUpdate);
            });
        };
    }, [voiceMembers]);

    return (
        <div className="mini-voice-members">
            <div
                className="mini-voice-members-wrapper"
                data-show-gradient={showBottomGradient ? "true" : "false"}
            >
                <ul ref={listRef} className="mini-voice-members-list">
                    {voiceMembers.map((item) => (
                        <li key={item.id} className="mini-voice-members-list-element">
                                <img
                                    src={item.avatar || item.icon || defaultAvatar}
                                    alt=""
                                    className="voice-member-icon"
                                />        
                        </li>
                    ))}
                </ul>
            </div>
            
        </div>
    );
}
