import '../../css/list.css'
import '../../css/modals.css'

import friend from "../../assets/friend-icon.jpg"
import close from "../../assets/close-icon.png"




export default function RoomMembers({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <main className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">Участники</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                <ul className="list">
                    <li className="list-element">
                        <div className="list-element-name">
                            <img src={friend}></img>
                            <p>Ник друга</p>
                        </div>
                        <p className="list-element-status">Администратор</p>
                    </li> 
                    <li className="list-element">
                        <div className="list-element-name">
                            <img src={friend}></img>
                            <p>Ник друга</p>
                        </div>
                        <p className="list-element-status">Я</p>
                    </li> 
                    <li className="list-element">
                        <div className="list-element-name">
                            <img src={friend}></img>
                            <p>Ник друга</p>
                        </div>
                    </li>  
                    <li className="list-element">
                        <div className="list-element-name">
                            <img src={friend}></img>
                            <p>Ник друга</p>
                        </div>
                    </li>
                    <li className="list-element">
                        <div className="list-element-name">
                            <img src={friend}></img>
                            <p>Ник друга</p>
                        </div>
                    </li>  
                    <li className="list-element">
                        <div className="list-element-name">
                            <img src={friend}></img>
                            <p>Ник друга</p>
                        </div>
                    </li> 
                </ul>
            </div>
        </main>
    )
}