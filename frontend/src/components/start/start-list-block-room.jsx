import search from "../../assets/search-icon.png"
import plus from "../../assets/plus-icon.png"
import room from "../../assets/room-icon.jpg"

import StartSwitch from "./start-switch"
import { Link } from "react-router-dom";

export default function StartListRoom({ active, setActive }) {
    return (
        <main className="start-list-block">
            <div className="start-list-header">
                <img src={search}></img>
                <p>Комнаты</p>
                <img src={plus}></img>
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
        </main>
    );
}