import { useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/header"
import StartChatRoom from "../components/start/start-chat-block-room"
import StartListRoom from "../components/start/start-list-block-room"
import StartChatFriend from "../components/start/start-chat-block-friend"
import StartListFriend from "../components/start/start-list-block-friend"
import RegistationNotice from "../modals/registration-notice";

import '../css/start.css'

export default function Start() {

    const [active, setActive] = useState("room");

    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(!!location.state?.fromRegistration); // Открываем модал, если пришли из Registration

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <main>
            <Header/>
            
            <div className="start-page">
                {active === "room" && <StartListRoom active={active} setActive={setActive} />}
                {active === "room" && <StartChatRoom active={active} setActive={setActive} />}
                {active === "friend" && <StartListFriend active={active} setActive={setActive} />}
                {active === "friend" && <StartChatFriend active={active} setActive={setActive} />}
            </div>
            <RegistationNotice isOpen={isModalOpen} onClose={handleCloseModal} />
        </main>
    );
}