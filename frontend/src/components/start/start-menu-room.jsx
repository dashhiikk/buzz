import search from "../../assets/search-icon.png"
import plus from "../../assets/plus-icon.png"
import room from "../../assets/room-icon.jpg"

import CreateRoom from "../../modals/create-room"
import StartSwitch from "./start-switch"

import { Link } from "react-router-dom";
import { useState } from "react";

import '../../css/left-block.css'
import '../../css/list.css'

export default function StartListRoom({ active, setActive }) {

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const openModal = () => setIsCreateModalOpen(true);
    const closeModal = () => setIsCreateModalOpen(false);

    return (
        <main className="left-block">
            <div className="left-block-header">
                <img src={search} alt="Поиск" className="left-block-header-btn"></img>
                <p>Комнаты</p>
                <img src={plus} alt="Создать комнату" onClick={openModal} className="left-block-header-btn"></img>
            </div>
            <ul className="start-list">
                <Link to="/room" className="start-list-element">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </Link>
                <Link to="/room" className="start-list-element">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </Link>
                <Link to="/room" className="start-list-element">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </Link>
                <Link to="/room" className="start-list-element">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </Link>
                <Link to="/room" className="start-list-element">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </Link>
            </ul>
            <StartSwitch active={active} setActive={setActive} />
            <CreateRoom isOpen={isCreateModalOpen} onClose={closeModal} />
        </main>
    );
}