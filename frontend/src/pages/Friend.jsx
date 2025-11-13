import FriendChat from "../components/friend/friend-chat";
import FriendVoiceChat from "../components/friend/friend-voice";
import Header from "../components/header";

export default function Room () {
    return (
        <main >
            <Header/>
            <div className="page">
                <FriendVoiceChat/>
                <FriendChat/>
            </div>
            
            
        </main>
    )
}