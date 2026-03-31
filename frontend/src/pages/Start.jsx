import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { getRooms } from "../api/rooms";

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
        user,
        showRegistrationModal,
        showRecoveryModal,
        closeModals,
    } = useAuth();

    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return;
        const fetchRooms = async () => {
        try {
            const response = await getRooms();
            setRooms(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        };
        fetchRooms();
    }, [user]);

    const groupRooms = rooms.filter(room => !room.isPrivate);
    const privateRooms = rooms.filter(room => room.isPrivate);

    return (
        <main>
            <Header/>
            <div className="page">
                {active === "room" && (
                    <>
                        <StartMenu
                            title = "Комнаты"
                            items={groupRooms}
                            onAddClick={() => setIsCreateRoomOpen(true)}
                            active={active}
                            setActive={setActive}
                            onItemClick={(room) => {
                                navigate("/room", {
                                    state: { roomId: room.id, room }
                                });
                            }}
                            loading={loading}
                            error={error}
                            emptyMessage="У вас пока нет комнат, но вы можетее создать свою, 
                            нажав на + в правом верхнем углу, или присоединиться к существующей 
                            комнате перейдя по ссылке от друга или приняв приглашение."
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
                            items={privateRooms}
                            onAddClick={() => setIsAddFriendOpen(true)}
                            active={active}
                            setActive={setActive}
                            onItemClick={(friend) => {
                                navigate("/friend", {
                                    state: { friendId: friend.id, friend }
                                });
                            }}
                            loading={loading}
                            error={error}
                            emptyMessage="У вас пока нет друзей, но вы можете отправить запрос на дружбу другому пользователю, 
                            если знаете его ник и код, либо можете принять приглашение от друга."
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