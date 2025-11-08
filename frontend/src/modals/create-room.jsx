import React from "react";
import "../css/modals.css"; // Подключите стили для модального окна
import close from "../assets/close-icon.png"
import avatar from "../assets/add-avatar.png"

export default function CreateRoom({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="add-modal-content">
                <h2 className="modal-header">Новая комната</h2>
                <button className="modal-close-button" onClick={onClose}>
                    <img src={close}></img>
                </button>
                <div className="add-modal-input">
                    <div className="add-room-modal-input-avatar">
                        <img src={avatar}></img>
                        <p>Добавьте<br />аватар</p>
                    </div>
                    <div className="add-room-modal-input-part">
                        <div className="add-modal-input-name"><p>Введите название</p></div>
                        <div className="add-modal-input-btn"><p>Создать</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}