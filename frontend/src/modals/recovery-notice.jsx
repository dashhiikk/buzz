import React from "react";
import "../css/modals.css"; // Подключите стили для модального окна
import close from "../assets/close-icon.png"

export default function RecoveryNotice({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="notice-modal">
            <div className="notice-modal-content">
                <h2>Пароль был изменен</h2>
                <button onClick={onClose}>
                    <img src={close}></img>
                </button>
            </div>
        </div>
    );
}