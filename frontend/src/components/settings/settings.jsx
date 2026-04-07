import "../../css/settings.css"

import { useEffect, useState } from "react";
import {Link} from "react-router-dom"

import open from "../../assets/down-arrow.svg"

import VolumeSlider from "./volume";

export default function Settings() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // через кадр после рендера добавляем класс open
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);


    return (
        <main className={`settings-case ${visible ? "open" : ""}`}>
            <div className="settings-block">
                <div className="settings-headder">
                    <p className="medium-text text--light">Настройки</p>
                </div>
                <div className="settings-device-block">
                    <div className="settings-device">
                        <p className="small-text text--light">Устройство<br/>вывода</p>
                        <div className="change-device">
                            <p className="input-text text--light">Выбранное устройство</p>
                            <img src={open}/>
                        </div>
                    </div>
                    <div className="settings-device">
                        <p className="small-text text--light">Устройство<br/>ввода</p>
                        <div className="change-device">
                            <p className="input-text text--light">Выбранное устройство</p>
                            <img src={open}/>
                        </div>
                    </div>
                </div>
                <div className="settings-volume">
                    <p className="small-text text--light">Громкость микрофона</p>
                    <VolumeSlider/>
                    <p className="small-text text--light">Громкость звука</p>
                    <VolumeSlider/>
                    <p className="small-text text--light">Шумоподавление</p>
                    <VolumeSlider/>
                </div>
                <Link to="/settings" className="adv-settings-btn">
                    <p className="small-text text--light">Расширенные<br/>настройки</p>
                </Link>
            </div>
        </main>
    );
}