import { useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/header"
import StartChatRoom from "../components/start/start-chat-block-room"
import StartListRoom from "../components/start/start-list-block-room"
import StartChatFriend from "../components/start/start-chat-block-friend"
import StartListFriend from "../components/start/start-list-block-friend"
import RegistationNotice from "../modals/registration-notice";
import RecoveryNotice from "../modals/recovery-notice";

import '../css/start.css'

export default function Start() {

    const [active, setActive] = useState("room");

    const location = useLocation();
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(!!location.state?.fromRegistration); // Открываем модал, если пришли из Registration
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(!!location.state?.fromRecovery);

    const handleCloseModal = () => {
        setIsRegistrationModalOpen(false);
        setIsRecoveryModalOpen(false);
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
            <RegistationNotice isOpen={isRegistrationModalOpen} onClose={handleCloseModal} />
            <RecoveryNotice isOpen={isRecoveryModalOpen} onClose={handleCloseModal} />
        </main>
    );
}