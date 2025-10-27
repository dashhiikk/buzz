import search from "../../assets/search-icon.png"
import plus from "../../assets/plus-icon.png"
import room from "../../assets/room-icon.jpg"

import StartSwitch from "./start-switch"

export default function StartListRoom({ active, setActive }) {
    return (
        <main className="start-list-block">
            <div className="start-list-header">
                <img src={search}></img>
                <p>Комнаты</p>
                <img src={plus}></img>
            </div>
            <ul className="start-list">
                <li className="start-list-element">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </li>
                <li className="start-list-element">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </li>
                <li className="start-list-element">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </li>
                <li className="start-list-element">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </li>
                <li className="start-list-element">
                    <img src={room}></img>
                    <p>Название комнаты</p>
                </li>
            </ul>
            <StartSwitch active={active} setActive={setActive} />
        </main>
    );
}