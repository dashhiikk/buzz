import React, { useState } from "react";
import "../css/modals.css";
import close from "../assets/close-icon.png"

import Input from "../components/input";
import { sendFriendRequest } from "../api/friends";

export default function AddFriend({ isOpen, onClose }) {
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!inputValue.trim()) {
            setError("Введите ник друга в формате ник#код");
            return;
        }

        // Разбор строки "ник#код"
        const parts = inputValue.split("#");
        if (parts.length !== 2) {
            setError("Неверный формат. Используйте ник#код (например, user#1234)");
            return;
        }
        const username = parts[0].trim();
        const code = parts[1].trim();
        if (!username || !code) {
            setError("Ник и код не могут быть пустыми");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await sendFriendRequest(username, code);
            onClose(); // закрываем модалку при успехе
            setInputValue("");
        } catch (err) {
            setError(err.message || "Ошибка отправки запроса");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">Добавить друга</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                <div className="modal-input-block">
                    {error && <p className="small-text text--average">{error}</p>}
                    <Input
                        placeholder={"Ник#код"}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    
                    <button
                        className="modal-input-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        <p className="small-text text--light">
                            {loading ? "Отправка..." : "Добавить"}
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
}