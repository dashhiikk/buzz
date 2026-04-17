import { useRef} from "react";
import '../../../css/list.css'
import defaultAvatar from "../../../assets/room-default.jpg"
import demo from "../../../assets/demo-btn.svg"

export default function VoiceChatMembers({
    items,
    color = "light",
    demoOn,
    onOpenScreenShare,
}) {

    const listRef = useRef(null);

    return (
        <>
            <ul
                ref={listRef}
                className={`list list--${color}`}
            >
                {items.map(item => (
                    <li
                        key={item.id}
                        className={`list-element list-element--passive`}
                    >
                        <div className="list-element-name">
                            <img src={item.icon || defaultAvatar} alt="" />
                            <p className={`small-text text--dark`}>
                                {item.name}
                            </p>
                        </div>
                        <div className="voice-buttons">
                            {demoOn &&
                                <button className="voice-btn" type="button" onClick={onOpenScreenShare}>
                                    <img src={demo}/>
                                </button>
                            }
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}