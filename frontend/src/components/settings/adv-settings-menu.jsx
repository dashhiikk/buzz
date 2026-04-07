import backward from "../../assets/backward.svg"

import "../../css/settings.css"
import "../../css/left-block.css"
import "../../css/list.css"

import profile from "../../assets/user-icon.svg"
import wave from "../../assets/wave.svg"

import {Link} from "react-router-dom"
import List from "../list"

export default function AdvSettingsMenu({setActive}) {

     const settings = [
        { id: 1, key: "profile", name: "Профиль", icon: profile },
        { id: 2, key: "volume", name: "Звук", icon: wave },
    ];

    return (
        <main className="left-block">
            <div className="left-block-header">
                <Link to="/start">
                    <img src={backward} className="left-block-header-btn"></img>
                </Link>
                <p className="medium-text text--light">Наcтройки</p>
                <div style={{ width: '24px' }}></div>
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