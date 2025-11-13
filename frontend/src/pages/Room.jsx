import RoomChat from "../components/room/room-chat";
import RoomVoiceChat from "../components/room/room-voice";
import Header from "../components/header";
import RoomMembers from "../components/room/members";

import { useState } from "react";

export default function Room () {
    const [active, setActive] = useState("voice");
    return (
        <main >
            <Header/>
            <div className="page">
                {active === "members" && <RoomMembers active={active} setActive={setActive} />}
                {active === "voice" && <RoomVoiceChat active={active} setActive={setActive} />}
                <RoomChat/>
            </div>
            
            
        </main>
    )
}