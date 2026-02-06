import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/header"
import StartChatRoom from "../components/start/start-chat-room"
import StartListRoom from "../components/start/start-menu-room"
import StartChatFriend from "../components/start/start-chat-friend"
import StartListFriend from "../components/start/start-menu-friend"
import RegistationNotice from "../modals/registration-notice";
import RecoveryNotice from "../modals/recovery-notice";

import useIsPortrait from "../hooks/is-portrait";

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
        // replace: true — чтобы не добавлять новую запись в историю
        }
    }, [location, navigate]);

    return (
        <main>
            <Header/>
            <div className="page">
                {active === "room" && (
                    <>
                        <StartListRoom
                            active={active}
                            setActive={setActive}
                        />

                        {!isPortrait && (
                            <StartChatRoom
                                active={active}
                                setActive={setActive}
                            />
                        )}
                    </>
                )}
                {active === "friend" && (
                    <>
                        <StartListFriend
                            active={active}
                            setActive={setActive}
                        />

                        {!isPortrait && (
                            <StartChatFriend
                                active={active}
                                setActive={setActive}
                            />
                        )}
                    </>
                )}
            </div>
            <RegistationNotice isOpen={isRegistrationModalOpen} onClose={handleCloseModal} />
            <RecoveryNotice isOpen={isRecoveryModalOpen} onClose={handleCloseModal} />
        </main>
    );
}