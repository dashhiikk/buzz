import React from "react";
import "../css/modals.css";
import close from "../assets/close-icon.png"
import avatar from "../assets/add-avatar.png"

import Input from "../components/input";

export default function CreateRoom({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">Новая комната</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                <div className="modal-input-avatar">
                    <img  src={avatar}></img>
                </div>
                <div className="modal-input-block">
                    <Input placeholder={"Название комнаты"}/>
                    <div className="modal-input-btn">
                        <p className="small-text text--light">Создать</p>
                    </div>
                </div>
            </div>
        </div>
    );
}