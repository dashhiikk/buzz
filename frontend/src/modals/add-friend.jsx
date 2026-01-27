import React from "react";
import "../css/modals.css";
import close from "../assets/close-icon.png"

import Input from "../components/input";

export default function AddFriend({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">Добавить друга</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                    <div className="modal-input-block">
                        <Input placeholder={"Ник друга#1234"}/>
                        <div className="modal-input-btn">
                            <p className="small-text text--light">Добавить</p>
                        </div>
                    </div>
            </div>
        </div>
    );
}