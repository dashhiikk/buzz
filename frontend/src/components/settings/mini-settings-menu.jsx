import "../../css/settings/mini-settings-menu.css"

import darkprofile from "../../assets/profile.svg"
import darkvolume from "../../assets/volume.svg"

export default function MiniSettingsMenu({ active, setActive}) {
    
    const settings = [
        { id: 1, key: "profile", name: "Профиль", icon: darkprofile },
        { id: 2, key: "volume", name: "Звук", icon: darkvolume  },
    ];

    return (
        <div className="mini-settings-menu">
            <ul className="mini-settings-menu-list">
                {settings.map((item) => (
                    <li key={item.id} className="mini-settings-menu-list-element">
                        <button
                            type="button"
                            className={`mini-settings-menu-btn ${
                                active === item.key ? "is-active" : ""
                            }`}
                            onClick={() => setActive(item.key)}
                            title={item.name}
                        >
                            <img
                                src={item.icon}
                                alt={item.name}
                            />
                        </button>       
                    </li>
                ))}
            </ul>
        </div>
    );
}