import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { joinRoomByToken } from "../api/rooms";
import { useAuth } from "../hooks/use-auth";

export default function JoinRoom() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            // Не авторизован: сохраняем токен в sessionStorage и перенаправляем на главную с параметром redirect
            sessionStorage.setItem("pendingInviteToken", token);
            navigate(`/?redirect=/rooms/join/${token}`);
            return;
        }

        // Авторизован: отправляем запрос на вступление
        joinRoomByToken(token)
            .then(response => {
                const roomId = response.data.roomId;
                navigate("/room", { state: { roomId } });
            })
            .catch(err => {
                console.error(err);
                navigate("/start");
            });
    }, [user, loading, token, navigate]);

    return <div>Подключение...</div>;
}
