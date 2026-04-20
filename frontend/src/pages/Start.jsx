import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { getRooms } from "../api/rooms";

import Header from "../components/header/header"
import StartChat from "../components/start/start-chat"
import StartMenu from "../components/start/start-menu"

import RegistationNotice from "../modals/registration-notice";
import RecoveryNotice from "../modals/recovery-notice";

import SendRequest from "../modals/send-request"
import CreateRoom from "../modals/create-room"

import useTwoPanelLayout from "../hooks/use-two-panel-layout";

import "../css/page/blocks.css"
import "../css/page/layout.css"

export default function Start() {

    const [active, setActive] = useState("room");

    const layout = useTwoPanelLayout({
        defaultPane: "left" // left = voice, right = chat
    });

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

    useEffect(() => {
        if (!user) return;
        fetchRooms();
    }, [user]);

    const groupRooms = rooms.filter(room => !room.isPrivate);
    const privateRooms = rooms.filter(room => room.isPrivate);

    return (
        <main>
            <Header/>
            <div className="page" data-layout={layout.layoutMode}>
                {active === "room" && (
                    <>
                        <div
                            className={`panel-shell panel-shell--left ${
                                layout.isSinglePane
                                    ? layout.activePane === "left"
                                        ? "panel-shell--active"
                                        : "panel-shell--hidden-left"
                                    : "panel-shell--split"
                            }`}
                        >
                            <div className="left-block">
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
                                    emptyMessage="У вас пока нет комнат, 
                                    но вы можете создать свою, нажав на + в правом верхнем углу, или присоединиться к существующей 
                                    комнате, перейдя по ссылке от друга или приняв приглашение."
                                />
                            </div>
                        </div>

                        <div
                            className={`panel-shell panel-shell--right ${
                                layout.isSinglePane
                                    ? layout.activePane === "right"
                                        ? "panel-shell--active"
                                        : "panel-shell--hidden-right"
                                    : "panel-shell--split"
                            }`}
                        >
                            <div className="right-panel-stack">
                                <div className="right-block">
                                    <StartChat text="Зайдите в комнату, чтобы начать общение"/>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {active === "friend" && (
                    <>
                        <div
                            className={`panel-shell panel-shell--left ${
                                layout.isSinglePane
                                    ? layout.activePane === "left"
                                        ? "panel-shell--active"
                                        : "panel-shell--hidden-left"
                                    : "panel-shell--split"
                            }`}
                        >
                            <div className="left-block">
                                <StartMenu
                                    title = "Друзья"
                                    items={privateRooms}
                                    onAddClick={() => setIsAddFriendOpen(true)}
                                    active={active}
                                    setActive={setActive}
                                    onItemClick={(room) => {
                                        navigate("/room", {
                                            state: { roomId: room.id, room }
                                        });
                                    }}
                                    loading={loading}
                                    error={error}
                                    emptyMessage="У вас пока нет друзей, 
                                    но вы можете отправить запрос на дружбу другому пользователю, если знаете его ник и код, нажав на + в правом верхнем углу. 
                                    Либо можете принять приглашение от друга."
                                />
                            </div>
                        </div>

                        <div
                            className={`panel-shell panel-shell--right ${
                                layout.isSinglePane
                                    ? layout.activePane === "right"
                                        ? "panel-shell--active"
                                        : "panel-shell--hidden-right"
                                    : "panel-shell--split"
                            }`}
                        >
                            <div className="right-panel-stack">
                                <div className="right-block">
                                    <StartChat text="Выберите друга, чтобы начать общение"/>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <SendRequest
                isOpen={isAddFriendOpen} 
                onClose={() => setIsAddFriendOpen(false)}
                type="friend" 
                onFriendAdded={fetchRooms}
            />
            <CreateRoom 
                isOpen={isCreateRoomOpen} 
                onClose={() => setIsCreateRoomOpen(false)} 
                onRoomCreated={fetchRooms}
            />    
            <RegistationNotice isOpen={showRegistrationModal} onClose={closeModals} />
            <RecoveryNotice isOpen={showRecoveryModal} onClose={closeModals} />
        </main>
    );
}