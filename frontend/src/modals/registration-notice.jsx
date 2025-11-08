import React from "react";
import "../css/modals.css"; // Подключите стили для модального окна
import close from "../assets/close-icon.png"

export default function RegistationNotice({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="notice-modal-content">
                <h2 className="modal-header">Добро пожаловать в buzz!</h2>
                <button className="modal-close-button" onClick={onClose}>
                    <img src={close}></img>
                </button>
            </div>
        </div>
    );
}