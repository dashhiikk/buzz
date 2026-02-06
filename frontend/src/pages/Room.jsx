import RoomChat from "../components/room/room-chat";
import RoomVoiceChat from "../components/room/room-voice";
import Header from "../components/header";
import RoomMembers from "../components/room/members";

import { useEffect, useState } from "react";

import useIsPortrait from "../hooks/is-portrait";
import useSwipe from "../hooks/swipe";

import "../css/swipe.css"

export default function Room () {

    const isPortrait = useIsPortrait();
    const [mobileView, setMobileView] = useState("voice");
    useEffect(() => {
        if (isPortrait) {
            setMobileView("voice");
        }
    }, [isPortrait]);

    const swipeHandlers = useSwipe({
        onSwipeLeft: () => {
            if (isPortrait && mobileView === "voice") {
                setMobileView("chat");
            }
        },
        onSwipeRight: () => {
            if (isPortrait && mobileView === "chat") {
                setMobileView("voice");
            }
        }
    });

    return (
        <main>
            <Header/>
            <div className="page" {...swipeHandlers}>
                {(!isPortrait || mobileView === "voice") && (
                    <RoomVoiceChat/> 
                )}
                
                { (!isPortrait || mobileView === "chat") && (
                    <RoomChat/>
                ) }
                
            </div>
            {isPortrait && (
                <div className="swipe-dots">
                    <span
                        className={`swipe-dot ${
                            mobileView === "voice" ? "active" : ""
                        }`}
                    />
                    <span
                        className={`swipe-dot ${
                            mobileView === "chat" ? "active" : ""
                        }`}
                    />
                </div>
            )}
        </main>
    )
}