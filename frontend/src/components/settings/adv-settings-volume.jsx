import "../../css/settings.css"


import VolumeSlider from "./volume";
import open from "../../assets/down-arrow.svg"

export default function AdvSettingsVolume() {
    return (
        <main className="right-block-content">
            <div className="right-block-header">
                <p className="large-text text--light">Звук</p>
            </div>
            <div className="settings-device-block">
                <div className="settings-device">
                    <p className="medium-text text--light">Устройство<br/>вывода</p>
                    <div className="change-device">
                        <p className="input-text text--light">Выбранное устройство</p>
                        <img src={open}/>
                    </div>
                </div>
                <div className="settings-device">
                    <p className="medium-text text--light">Устройство<br/>ввода</p>
                    <div className="change-device">
                        <p className="input-text text--light">Выбранное устройство</p>
                        <img src={open}/>
                    </div>
                </div>
            </div>
            <div className="adv-settings-input">
                <div className="settings-volume adv-settings-volume">
                    <p className="medium-text text--light">Громкость микрофона</p>
                    <VolumeSlider/>
                    <p className="medium-text text--light">Громкость звука</p>
                    <VolumeSlider/>
                    <p className="medium-text text--light">Шумоподавление</p>
                    <VolumeSlider/>
                </div>
            </div>
        </main>
    );
}