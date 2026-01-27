import React from "react";
import "../css/modals.css"; // Подключите стили для модального окна
import close from "../assets/close-icon.png"

export default function RecoveryNotice({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">Пароль был изменен</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
            </div>
        </div>
    );
}