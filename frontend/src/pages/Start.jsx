import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { getRooms } from "../api/rooms";
import { getFriends } from "../api/fiends";

import Header from "../components/header"
import StartChat from "../components/start/start-chat"
import StartMenu from "../components/start/start-menu"

import RegistationNotice from "../modals/registration-notice";
import RecoveryNotice from "../modals/recovery-notice";

import AddFriend from "../modals/add-friend"
import CreateRoom from "../modals/create-room"

import useIsPortrait from "../hooks/is-portrait";

export default function Start() {

    const [active, setActive] = useState("room");
    const isPortrait = useIsPortrait();

    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        if (location.state) {
        navigate(location.pathname, { replace: true }); 
        }
    }, [location, navigate]);

    const {
        showRegistrationModal,
        showRecoveryModal,
        closeModals,
    } = useAuth();

    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

    const [rooms, setRooms] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Загружаем комнаты и друзей параллельно
                const [roomsRes, friendsRes] = await Promise.all([
                getRooms(),
                getFriends(),
                ]);
                setRooms(roomsRes.data);
                setFriends(friendsRes.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Не удалось загрузить данные");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    // Если ошибка – показать сообщение и, возможно, кнопку повтора
    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    const roomsForMenu = rooms.map(room => ({
        id: room.id,
        name: room.name,
        avatar: room.icon || room.avatar || room, // используем room.icon, если есть, иначе дефолтный
    }));
    const friendsForMenu = friends.map(friend => ({
        id: friend.id,
        name: friend.username,
        avatar: friend.avatar || friend, // используем friend.avatar, если есть
    }));

    return (
        <main>
            <Header/>
            <div className="page">
                {active === "room" && (
                    <>
                        <StartMenu
                            title = "Комнаты"
                            items={roomsForMenu}
                            onAddClick={() => setIsCreateRoomOpen(true)}
                            active={active}
                            setActive={setActive}
                            onItemClick={(room) => {
                                navigate("/room", {
                                    state: { roomId: room.id, room }
                                });
                            }}
                        />
                        {!isPortrait && (
                            <StartChat text="Зайдите в комнату, чтобы начать общение"/>
                        )}
                    </>
                )}
                {active === "friend" && (
                    <>
                        <StartMenu
                            title = "Друзья"
                            items={friendsForMenu}
                            onAddClick={() => setIsAddFriendOpen(true)}
                            active={active}
                            setActive={setActive}
                            onItemClick={(friend) => {
                                navigate("/friend", {
                                    state: { friendId: friend.id, friend }
                                });
                            }}
                        />
                        {!isPortrait && (
                            <StartChat text="Выберите друга, чтобы начать общение"/>
                        )}
                    </>
                )}
            </div>

            <AddFriend isOpen={isAddFriendOpen} onClose={() => setIsAddFriendOpen(false)} />
            <CreateRoom isOpen={isCreateRoomOpen} onClose={() => setIsCreateRoomOpen(false)} />    

            <RegistationNotice isOpen={showRegistrationModal} onClose={closeModals} />
            <RecoveryNotice isOpen={showRecoveryModal} onClose={closeModals} />
        </main>
    );
}