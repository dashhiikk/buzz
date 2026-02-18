import backward from "../../assets/backward-icon.png"

import "../../css/settings.css"
import "../../css/left-block.css"
import "../../css/list.css"

import profile from "../../assets/user-icon.png"
import wave from "../../assets/wave-icon.png"
import question from "../../assets/question-icon.png"

import {Link} from "react-router-dom"
import List from "../list"

export default function AdvSettingsMenu({setActive}) {

     const settings = [
        { id: 1, key: "profile", name: "Профиль", avatar: profile },
        { id: 2, key: "volume", name: "Звук", avatar: wave },
        { id: 3, key: "help", name: "Что-то ещё", avatar: question },
    ];

    return (
        <main className="left-block">
            <div className="settings-headder">
                <Link to="/start">
                    <img src={backward} className="left-block-header-btn"/>
                </Link>
                <p>Наcтройки</p>
                <p></p>
            </div>
            <List 
                items={settings}
                mode="active"
                color="light"
                onItemClick={(item) => setActive(item.key)}
            />
        </main>
    );
}