import '../../css/list.css'
import '../../css/modals.css'

import friend from "../../assets/friend-icon.jpg"
import close from "../../assets/close-icon.png"

import List from '../list'


export default function RoomMembers({ isOpen, onClose }) {
    if (!isOpen) return null;

    const roomMembers = [
        { id: 1, name: "Ник друга", avatar: friend},
        { id: 2, name: "Ник друга", avatar: friend},
        { id: 3, name: "Ник друга", avatar: friend },
        { id: 4, name: "Ник друга", avatar: friend },
        { id: 5, name: "Ник друга", avatar: friend },
        { id: 6, name: "Ник друга", avatar: friend },
        { id: 7, name: "Ник друга", avatar: friend },
        { id: 8, name: "Ник друга", avatar: friend },
        { id: 9, name: "Ник друга", avatar: friend },
        { id: 10, name: "Ник друга", avatar: friend },
        { id: 11, name: "Ник друга", avatar: friend },
        { id: 12, name: "Ник друга", avatar: friend },
        { id: 13 , name: "Ник друга", avatar: friend },
    ];

    return (
        <main className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">Участники</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                <List items={roomMembers} mode="passive" color="light"/>
            </div>
        </main>
    )
}