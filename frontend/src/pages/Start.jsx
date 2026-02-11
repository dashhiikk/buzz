import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/header"
import StartChat from "../components/start/start-chat"
import StartMenu from "../components/start/start-menu"

import RegistationNotice from "../modals/registration-notice";
import RecoveryNotice from "../modals/recovery-notice";

import AddFriend from "../modals/add-friend"
import CreateRoom from "../modals/create-room"

import useIsPortrait from "../hooks/is-portrait";

import room from "../assets/room-icon.jpg"
import friend from "../assets/friend-icon.jpg"

export default function Start() {

    const [active, setActive] = useState("room");
    const isPortrait = useIsPortrait();

    const location = useLocation();

    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(!!location.state?.fromRegistration); // Открываем модал, если пришли из Registration
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(!!location.state?.fromRecovery);

    const handleCloseModal = () => {
        setIsRegistrationModalOpen(false);
        setIsRecoveryModalOpen(false);
    };
    
    const navigate = useNavigate();
    useEffect(() => {
        if (location.state) {
        navigate(location.pathname, { replace: true }); 
        }
    }, [location, navigate]);

    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

    const friends = [
        { id: 1, name: "Ник друга", avatar: friend},
        { id: 2, name: "Ник друга", avatar: friend},
        { id: 3, name: "Ник друга", avatar: friend },
        { id: 4, name: "Ник друга", avatar: friend },
        { id: 5, name: "Ник друга", avatar: friend },
        { id: 6, name: "Ник друга", avatar: friend },
        { id: 7, name: "Ник друга", avatar: friend },
        { id: 8, name: "Ник друга", avatar: friend },
        { id: 9, name: "Ник друга", avatar: friend },
        { id: 10, name: "Ник друга", avatar: friend },
    ];

    const rooms = [
        { id: 1, name: "Название комнаты", avatar: room},
        { id: 2, name: "Название комнаты", avatar: room},
        { id: 3, name: "Название комнаты", avatar: room},
        { id: 4, name: "Название комнаты", avatar: room},
        { id: 5, name: "Название комнаты", avatar: room},
        { id: 6, name: "Название комнаты", avatar: room},
        { id: 7, name: "Название комнаты", avatar: room},
        { id: 8, name: "Название комнаты", avatar: room},
        { id: 9, name: "Название комнаты", avatar: room},
        { id: 10, name: "Название комнаты", avatar: room},
    ];

    return (
        <main>
            <Header/>
            <div className="page">
                {active === "room" && (
                    <>
                        <StartMenu
                            title = "Комнаты"
                            items={rooms}
                            onAddClick={() => setIsCreateRoomOpen(true)}
                            active={active}
                            setActive={setActive}
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
                            items={friends}
                            onAddClick={() => setIsAddFriendOpen(true)}
                            active={active}
                            setActive={setActive}
                        />
                        {!isPortrait && (
                            <StartChat text="Выберите друга, чтобы начать общение"/>
                        )}
                    </>
                )}
            </div>

            <AddFriend isOpen={isAddFriendOpen} onClose={() => setIsAddFriendOpen(false)} />
            <CreateRoom isOpen={isCreateRoomOpen} onClose={() => setIsCreateRoomOpen(false)} />    

            <RegistationNotice isOpen={isRegistrationModalOpen} onClose={handleCloseModal} />
            <RecoveryNotice isOpen={isRecoveryModalOpen} onClose={handleCloseModal} />
        </main>
    );
}