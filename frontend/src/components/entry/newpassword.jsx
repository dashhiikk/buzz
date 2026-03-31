import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";

import buzzlogo from "../../assets/buzz-logo.svg"

import Input from "../input"

export default function NewPassword() {
    const { updatePassword, openRecoveryModal } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!password || !passwordRepeat) {
        setError("Заполните все поля");
        return;
        }

        if (password !== passwordRepeat) {
        setError("Пароли не совпадают");
        return;
        }

        if (!token) {
        setError("Ссылка недействительна или токен отсутствует");
        return;
        }

        try {
        setLoading(true);
        await updatePassword(token, password);
        openRecoveryModal();
        localStorage.setItem("emailVerified", Date.now());
        navigate("/start", { replace: true })
        } catch (err) {
        setError(err.message || "Ошибка при смене пароля");
        } finally {
        setLoading(false);
        }
    };

    return (
        <main className="entry-block">
            <img src={buzzlogo} alt="logo"/>
            <p className='large-text text--light'>Восстановление пароля</p>ъ
            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            <form onSubmit={handleSubmit} className="entry-input-block">
                <Input
                placeholder="Введите новый пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                placeholder="Повторите пароль"
                type="password"
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
                />

                <button className="entry-input-btn" type="submit" disabled={loading}>
                <p className="small-text text--light">
                    {loading ? "Сохранение..." : "Сохранить"}
                </p>
                </button>
            </form>
        </main>
    );
}