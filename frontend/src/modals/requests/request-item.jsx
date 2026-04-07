import defaultAvatar from "../../assets/buzz-icon-bee.svg";
import acceptIcon from "../../assets/accept.svg"
import rejectIcon from "../../assets/reject.svg"
import cancelIcon from "../../assets/cancel.svg"

export default function RequestItem({ request, isIncoming, onAccept, onReject, onCancel }) {
    const getDescription = () => {
        if (request.type === "friend") {
            if (isIncoming) {
                return `${request.senderName}#${request.senderCode} хочет добавить вас в друзья`;
            } else {
                return `Вы отправили запрос в друзья ${request.senderName}#${request.senderCode}`;
            }
        } else if (request.type === "room") {
            if (isIncoming) {
                return `${request.senderName}#${request.senderCode} приглашает вас в комнату "${request.roomName}"`;
            } else {
                return `Вы пригласили ${request.senderName}#${request.senderCode} в комнату "${request.roomName}"`;
            }
        }
        return "";
    };

    const avatar = request.senderAvatar || defaultAvatar;
    const isPending = request.status === "pending";

    return (
        <li className="list-element list-element--active">
            <div className="list-element-name">
                <img src={avatar} alt="" />
                <p className="small-text text--light list-element-name-request">
                    {getDescription()}
                </p>
            </div>
            <div className="request-buttons">
                {!isPending ? (
                    <span className={`request-status ${request.status === "accepted" ? "accept-status" : "reject-status"} small-text text--dark`}>
                        {request.status === "accepted" ? "Принят" : "Отклонён"}
                    </span>
                ) : (
                        isIncoming ? (
                        <>
                            <button onClick={() => onAccept(request.id)} className="accept-btn"><img src ={acceptIcon} alt="Принять"/></button>
                            <button onClick={() => onReject(request.id)} className="reject-btn"><img src ={rejectIcon} alt="Отклонить"/></button>
                        </>
                    ) : (
                        <button onClick={() => onCancel(request.id)} className="cancel-btn"><img src ={cancelIcon} alt="Отменить"/></button>
                    )
                )}
            </div>
        </li>
    );
}