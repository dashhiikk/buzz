import "../../css/settings.css"
import "../../css/right-block.css"

import VolumeSlider from "./volume";
import open from "../../assets/down-arrow.png"

export default function AdvSettingsVolume() {
    return (
        <main className="right-block">
            <div className="right-block-header">
                <p className="large-text text--light">Звук</p>
            </div>
            <div className="adv-settings-input-block">
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
            <div className="adv-settings-input-block">
                <div className="adv-settings-input">
                    <div className="settings-volume adv-settings-volume">
                        <p>Громкость микрофона</p>
                        <VolumeSlider/>
                        <p>Громкость звука</p>
                        <VolumeSlider/>
                        <p>Шумоподавление</p>
                        <VolumeSlider/>
                    </div>
                </div>
            </div>
        </main>
    );
}