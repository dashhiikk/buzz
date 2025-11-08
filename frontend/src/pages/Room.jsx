import RoomChat from "../components/room/room-chat";
import PinnedMessage from "../components/room/room-pinned-message";
import RoomVoiceChat from "../components/room/room-voice";
import Members from "../components/room/room.members";
import Header from "../components/header";

export default function Room () {
    return (
        <main >
            <Header/>
            <Members/>
            <div className="page">
                <div className="left-block">
                    <RoomVoiceChat/>
                    <PinnedMessage/>
                </div>
                <RoomChat/>
            </div>
            
            
        </main>
    )
}