import React, { useState , useRef } from "react";
import "../css/modals.css";
import close from "../assets/close-icon.png"
import defaultAvatar from "../assets/add-avatar.png"

import Input from "../components/input";

import { createRoom } from "../api/rooms";
import { uploadFile } from "../api/upload";

export default function CreateRoom({ isOpen, onClose, onRoomCreated}) {
    const [name, setName] = useState("");
    const [icon, setIcon] = useState(null); // если нужна иконка
    const [iconPreview, setIconPreview] = useState(defaultAvatar);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Можно загружать только изображения");
            return;
        }
        // Проверка типа и размера (опционально)
        if (file.size > 5 * 1024 * 1024) {
            setError("Размер файла не должен превышать 5 МБ");
            return;
        }

        setUploading(true);
        setError("");

        try {
            const response = await uploadFile(file);
            const imageUrl = response.data.url;
            setIcon(imageUrl);
            setIconPreview(imageUrl);
        } catch (err) {
            setError(err.message || "Ошибка загрузки изображения");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Введите название комнаты");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await createRoom(name, icon);
            onRoomCreated(); // обновляем список комнат в родителе
            onClose(); // закрываем модалку
            setName(""); // очищаем поле
            setIcon(null);
        } catch (err) {
            setError(err.message || "Ошибка создания комнаты");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <p className="medium-text text--light">Новая комната</p>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={close}></img>
                </button>
                 <div className="modal-input-avatar">
                    <img
                        src={iconPreview}
                        alt="room icon"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ cursor: "pointer" }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>
                <div className="modal-input-block">
                    <Input 
                        placeholder={"Название комнаты"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {uploading && <p className="info-message">Загрузка изображения...</p>}
                    {error && <p className="error-message">{error}</p>}
                    <button
                        className="modal-input-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        <p className="small-text text--light">
                            {loading ? "Создание..." : "Создать"}
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
}