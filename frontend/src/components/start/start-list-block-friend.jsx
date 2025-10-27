import search from "../../assets/search-icon.png"
import plus from "../../assets/plus-icon.png"
import friend from "../../assets/friend-icon.jpg"

import StartSwitch from "./start-switch"

export default function StartListFriend({ active, setActive }) {
    return (
        <main className="start-list-block">
            <div className="start-list-header">
                <img src={search}></img>
                <p>Комнаты</p>
                <img src={plus}></img>
            </div>
            <ul className="start-list">
                <li className="start-list-element">
                    <img src={friend}></img>
                    <p>Ник друга</p>
                </li>
                <li className="start-list-element">
                    <img src={friend}></img>
                    <p>Ник друга</p>
                </li>
                <li className="start-list-element">
                    <img src={friend}></img>
                    <p>Ник друга</p>
                </li>
                <li className="start-list-element">
                    <img src={friend}></img>
                    <p>Ник друга</p>
                </li>
                <li className="start-list-element">
                    <img src={friend}></img>
                    <p>Ник друга</p>
                </li>
            </ul>
            <StartSwitch active={active} setActive={setActive} />
        </main>
    );
}