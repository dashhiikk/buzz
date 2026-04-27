import React, { useState } from "react";
import { createPortal } from "react-dom";
import "../css/modals.css";
import close from "../assets/close.svg"

import Input from "../components/input";
import { sendFriendRequest } from "../api/friends";
import { sendRoomInvite } from "../api/rooms";

export default function SendRequest({ isOpen, onClose, type = "friend", roomId = null }) {
    const [username, setUsername] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isFriend = type === "friend";
    const title = isFriend ? "Добавить друга" : "Пригласить в комнату";
    const buttonText = isFriend ? (loading ? "Отправка..." : "Добавить") : (loading ? "Отправка..." : "Пригласить");
   
    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!username.trim() || !code.trim()) {
            setError("Заполните оба поля: ник и код");
            return;
        }
        setLoading(true);
        setError("");
        try {
            if (isFriend) {
                await sendFriendRequest(username, code);
            } else {
                if (!roomId) throw new Error("ID комнаты не указан");
                await sendRoomInvite(roomId, username, code);
            }
            onClose();
            setUsername("");
            setCode("");
        } catch (err) {
            let errorMessage = err.message || `Ошибка ${isFriend ? "отправки запроса" : "приглашения"}`;
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.errors) {
                // Если сервер возвращает структурированные ошибки
                const errors = err.response.data.errors;
                errorMessage = Object.values(errors).join(", ");
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">{title}</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                <div className="modal-input-block ">
                    {error && <p className="small-text text--average">{error}</p>}
                    <div className="modal-input-field">
                        <Input
                            placeholder={"Ник пользователя"}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Input
                            placeholder={"код"}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            prefix="#"
                        />
                    </div>
                    <button
                        className="modal-input-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        <p className="small-text text--light">{buttonText}</p>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
