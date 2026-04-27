import { useRef } from "react"

import defaultAvatar from "../../../assets/room-default.jpg"
import demo from "../../../assets/demo.svg"

import "../../../css/list.css"

export default function VoiceChatMembers({
    items = [],
    color = "light",
    onOpenScreenShare,
}) {
    const listRef = useRef(null)

    return (
        <ul ref={listRef} className={`list list--${color}`}>
            {items.map((item) => (
                <li
                    key={item.participantId || item.id}
                    className="list-element list-element--passive"
                >
                    <div className="list-element-name">
                        <img src={item.icon || defaultAvatar} alt="" />
                        <p className="small-text text--dark">
                            {item.name}
                        </p>
                    </div>

                    <div className="voice-buttons">
                        {item.isScreenSharing && (
                            <button
                                className="voice-btn"
                                type="button"
                                onClick={() => onOpenScreenShare?.(item)}
                            >
                                <img src={demo} alt="Открыть демонстрацию" />
                            </button>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    )
}
