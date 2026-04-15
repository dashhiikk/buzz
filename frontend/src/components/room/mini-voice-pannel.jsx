import { useRef} from "react";
import defaultAvatar from "../../assets/user-icon.svg"
import "../../css/voice/mini-voice-pannel.css"

export default function MiniVoiceChatPanel({
    voiceMembers = [],
}) {
    const listRef = useRef(null);
    return (
        <div className="mini-voice-pannel">
            <ul
                ref={listRef}
                className={`mini-voice-members-list`}
            >
                {voiceMembers.map(item => (
                    <li
                        key={item.id}
                        className={`mini-voice-members-list-element`}
                    >
                        <img src={item.icon || defaultAvatar} alt="" />
                    </li>
                ))}
            </ul>
        </div>
    );
}