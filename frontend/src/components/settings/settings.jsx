import "../../css/settings.css"

import { useEffect, useState } from "react";
import {Link} from "react-router-dom"

import open from "../../assets/down-arrow.png"

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
                    <p>Настройки</p>
                </div>
                <div className="settings-device-block">
                    <div className="settings-device">
                        <p>Устройство<br/>вывода</p>
                        <div className="change-device">
                            <p>Выбранное устройство</p>
                            <img src={open}/>
                        </div>
                    </div>
                    <div className="settings-device">
                        <p>Устройство<br/>ввода</p>
                        <div className="change-device">
                            <p>Выбранное устройство</p>
                            <img src={open}/>
                        </div>
                    </div>
                </div>
                <div className="settings-volume">
                    <p>Громкость микрофона</p>
                    <VolumeSlider/>
                    <p>Громкость звука</p>
                    <VolumeSlider/>
                    <p>Шумоподавление</p>
                    <VolumeSlider/>
                </div>
                <Link to="/settings" className="adv-settings-btn">
                    <p>Расширенные<br/>настройки</p>
                </Link>
            </div>
        </main>
    );
}