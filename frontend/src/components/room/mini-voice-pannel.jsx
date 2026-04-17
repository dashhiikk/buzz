import { useLayoutEffect, useRef, useState } from "react";
import defaultAvatar from "../../assets/user-icon.svg"
import "../../css/voice/mini-voice-pannel.css"

import chat from "../../assets/chat.svg"
import video from "../../assets/video.svg"
import board from "../../assets/board.svg"
import disconnect from "../../assets/disconnect-btn.svg"
import demo from "../../assets/demo-btn.svg"

import micON from "../../assets/mic-on.svg";
import headON from "../../assets/head-on.svg";
import micOFF from "../../assets/mic-off.svg";
import headOFF from "../../assets/head-off.svg";
import demoON from "../../assets/demo-on.svg"
import demoOFF from "../../assets/demo-off.svg"
import cameraON from "../../assets/camera-on.svg"
import cameraOFF from "../../assets/camera-off.svg"

export default function MiniVoiceChatPanel({
    voiceMembers = [],
    onDisconnectVoice,
    onOpenScreenShare,
    onOpenVideoChat,
    onOpenChat,
    micOn,
    setMicOn,
    headphonesOn,
    setHeadphonesOn,
    demoOn,
    setDemoOn,
    cameraOn,
    setCameraOn,
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

    const handleOpenMemberScreenShare = (member) => {
        if (!member.isScreenSharing) return;
        onOpenScreenShare?.(member);
    };

    return (
        <div className="mini-voice-pannel">
            <div className="mini-voice-members">
                <div
                    className="mini-voice-members-wrapper"
                    data-show-gradient={showBottomGradient ? "true" : "false"}
                >
                    <ul ref={listRef} className="mini-voice-members-list">
                        {voiceMembers.map((item) => (
                            <li key={item.id} className="mini-voice-members-list-element">
                                <button
                                    type="button"
                                    className={`voice-member-btn ${item.isScreenSharing ? "is-clickable" : ""}`}
                                    onClick={() => handleOpenMemberScreenShare(item)}
                                    disabled={!item.isScreenSharing}
                                    title={
                                        item.isScreenSharing
                                            ? "Открыть демонстрацию экрана"
                                            : ""
                                    }
                                >
                                    <img
                                        src={item.avatar || defaultAvatar}
                                        alt=""
                                        className="voice-member-icon"
                                    />
                                </button>   
                                {item.isScreenSharing && (
                                    <button
                                        type="button"
                                        className="open-demo-btn"
                                        onClick={() => handleOpenMemberScreenShare(item)}
                                        title="Открыть демонстрацию экрана"
                                    >
                                        <img src={demo} alt="Демонстрация экрана" />
                                    </button>
                                )}         
                            </li>
                        ))}
                    </ul>
                </div>
                <button 
                    type="button"
                    className="mini-disconnect-btn"
                    onClick={onDisconnectVoice}
                >
                    <img src={disconnect} alt="Отключиться" />
                </button>
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
            </div>
            <div className="mini-voice-btns">
                <button type="button" onClick={() => setMicOn((prev) => !prev)}> 
                    <img src={micOn ? micON : micOFF} alt="Микрофон"/>
                </button>
                <button type="button" onClick={() => setHeadphonesOn((prev) => !prev)}>
                    <img src={headphonesOn ? headON : headOFF} alt="Наушники" />
                </button>
                <button type="button" onClick={() => setDemoOn((prev) => !prev)}>
                    <img src={demoOn ? demoON : demoOFF} alt="Демонстрация экрана" />
                </button>
                <button type="button" onClick={() => setCameraOn((prev) => !prev)}>
                    <img src={cameraOn ? cameraON : cameraOFF} alt="Видео" />
                </button>
            </div>
        </div>
    );
}