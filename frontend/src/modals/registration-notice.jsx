import React from "react";
import "../css/modals.css"; // Подключите стили для модального окна
import close from "../assets/close-icon.png"

export default function RegistationNotice({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">Добро пожаловать в buzz!</p>
                <p className="large-text text--light">#0000</p>
                <p className="small-text text--dark">Вам был присвоен уникальный код, который будет использоваться вместе с ником. Вы можете изменить его в настройках.</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
            </div>
        </div>
    );
}