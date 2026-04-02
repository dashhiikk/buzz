import '../../css/list.css'
import '../../css/modals.css'
import { useState } from "react";
import friend from "../../assets/friend-icon.jpg"
import close from "../../assets/close-icon.png"

import List from '../../components/list'
import RequestsSwitch from './request-switch';

export default function Requests({ isOpen, onClose }) {
    const incomingRequests = [
        { id: 1, name: "входящий", icon: friend},
        { id: 2, name: "Ник друга", icon: friend},
        { id: 3, name: "Ник друга", icon: friend },
        { id: 4, name: "Ник друга", icon: friend },
        { id: 5, name: "Ник друга", icon: friend },
        { id: 6, name: "Ник друга", icon: friend },
        { id: 7, name: "Ник друга", icon: friend },
        { id: 8, name: "Ник друга", icon: friend },
        { id: 9, name: "Ник друга", icon: friend },
        { id: 10, name: "Ник друга", icon: friend },
        { id: 11, name: "Ник друга", icon: friend },
        { id: 12, name: "Ник друга", icon: friend },
        { id: 13 , name: "Ник друга", icon: friend },
    ];

    const outgoingRequests = [
        { id: 1, name: "исходящий", icon: friend},
        { id: 2, name: "Ник друга", icon: friend},
        { id: 3, name: "Ник друга", icon: friend },
        { id: 4, name: "Ник друга", icon: friend },
        { id: 5, name: "Ник друга", icon: friend },
        { id: 6, name: "Ник друга", icon: friend },
        { id: 7, name: "Ник друга", icon: friend },
        { id: 8, name: "Ник друга", icon: friend },
        { id: 9, name: "Ник друга", icon: friend },
        { id: 10, name: "Ник друга", icon: friend },
        { id: 11, name: "Ник друга", icon: friend },
        { id: 12, name: "Ник друга", icon: friend },
        { id: 13 , name: "Ник друга", icon: friend },
    ];

    const [active, setActive] = useState("incoming");
    if (!isOpen) return null;

    return (
        <main className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">Запросы</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                {active === "incoming" && (
                    <List items={incomingRequests} mode="active" color="light"/>
                )}
                {active === "outgoing" && (
                    <List items={outgoingRequests} mode="active" color="light"/>
                )}
                <RequestsSwitch 
                    active={active}
                    setActive={setActive}
                />
            </div>
        </main>
    )
}