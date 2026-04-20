import backward from "../../assets/backward.svg"
import profile from "../../assets/user-icon.svg"
import volume from "../../assets/wave.svg"

import "../../css/settings.css"
import "../../css/left-block.css"
import "../../css/list.css"

import List from "../list"

export default function AdvSettingsMenu({ onBack, setActive}) {

    const settings = [
        { id: 1, key: "profile", name: "Профиль", icon: profile },
        { id: 2, key: "volume", name: "Звук", icon: volume  },
    ];

    return (
        <main className="left-block-content">
            <div className="left-block-header">
                <img src={backward} className="left-block-header-btn" onClick={onBack}/>
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