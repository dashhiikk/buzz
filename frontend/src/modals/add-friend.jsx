import React from "react";
import "../css/modals.css"; // Подключите стили для модального окна
import close from "../assets/close-icon.png"

export default function AddFriend({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="add-modal-content">
                <h2 className="modal-header">Добавить друга</h2>
                <button className="modal-close-button" onClick={onClose}>
                    <img src={close}></img>
                </button>
                <div className="add-modal-input">
                    <div className="add-friend-modal-input-part">
                        <div className="add-modal-input-name"><p>Введите ник и код пользователя (name#1234)</p></div>
                        <div className="add-modal-input-btn"><p>Добавить</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}