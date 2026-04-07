import '../../css/list.css'
import '../../css/modals.css'

import close from "../../assets/close.svg"
import plus from "../../assets/plus.svg"

import List from '../list'


export default function RoomMembers({ isOpen, onClose, onOpenInvite, participants, roomAdminId, currentUserId  }) {
    if (!isOpen) return null;

    const members = participants.map(p => {
        let status = '';
        if (p.id === roomAdminId && p.id === currentUserId) {
            status = 'Администратор (Вы)';
        } else if (p.id === roomAdminId) {
            status = 'Администратор';
        } else if (p.id === currentUserId) {
            status = 'Вы';
        }
        return {
            id: p.id,
            name: `${p.username}#${p.code}`,
            icon: p.avatar,
            status: status,
        };
    });

    return (
        <main className="modal">
            <div className="modal-content">
                <button className="modal-add-btn" >
                    <img src={plus} onClick={onOpenInvite}></img>
                </button>
                <p className="medium-text text--light">Участники</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                <List items={members} mode="passive" color="light"/>
            </div>
        </main>
    )
}