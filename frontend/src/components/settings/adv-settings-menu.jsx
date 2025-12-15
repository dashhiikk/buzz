import backward from "../../assets/backward-icon.png"

import "../../css/settings.css"
import "../../css/left-block.css"
import "../../css/list.css"

import profile from "../../assets/user-icon.png"
import wave from "../../assets/wave-icon.png"
import question from "../../assets/question-icon.png"

import {Link} from "react-router-dom"

export default function AdvSettingsMenu({setActive}) {
    return (
        <main className="left-block">
            <div className="settings-headder">
                <Link to="/start">
                    <img src={backward} className="left-block-header-btn"/>
                </Link>
                <p>Наcтройки</p>
                <p></p>
            </div>
            <ul className="list">
                <li className="list-element" onClick={() => setActive("profile")}>
                    <div className='list-element-name'>
                        <img src={profile}></img>
                        <p>Профиль</p>
                    </div>
                </li>  
                <li className="list-element" onClick={() => setActive("volume")}>
                    <div className='list-element-name'>
                        <img src={wave}></img>
                        <p>Звук</p>
                    </div>
                </li> 
                <li className="list-element">
                    <div className='list-element-name'>
                        <img src={question}></img>
                        <p>Что-то еще</p>
                    </div>
                </li> 
            </ul>
        </main>
    );
}