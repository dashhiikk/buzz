import Header from "../components/header/header";
import AdvSettingsMenu from "../components/settings/adv-settings-menu";
import AdvSettingsProfile from "../components/settings/adv-settings-profile";
import AdvSettingsVolume from "../components/settings/adv-settings-volume";
import MiniSettingsMenu from "../components/settings/mini-settings-menu";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useTwoPanelLayout from "../hooks/use-two-panel-layout";

import "../css/page/blocks.css"
import "../css/page/layout.css"
import "../css/page/transition-btn.css"

import darkBackward from "../assets/darkBackward.svg"


export default function SettingsPage () {
    const [active, setActive] = useState("profile");
    const navigate = useNavigate();

    const layout = useTwoPanelLayout({
        defaultPane: "right",
    });

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/start");
        }
    };

    return (
        <main >
            <Header/>
            <div className="page" data-layout={layout.layoutMode}>
                {!layout.isSinglePane && (
                    <div className="panel-shell panel-shell--left panel-shell--split">
                        <div className="left-block">
                            <AdvSettingsMenu
                                onBack = {handleGoBack}
                                active={active}
                                setActive={setActive}
                            />
                        </div>
                    </div>
                )}
                <div
                    className={`panel-shell panel-shell--right ${
                        layout.isSinglePane
                            ? "panel-shell--active"
                            : "panel-shell--split"
                    }`}
                >
                    <div className="right-panel-stack">
                        <div className="right-block">
                            {layout.isSinglePane && (
                                <button
                                    className="to-left-switch-btn"
                                    type="button"
                                    onClick={handleGoBack}
                                >
                                    <img src={darkBackward} alt="Назад" />
                                </button>
                            )}

                            {layout.isSinglePane && (
                                <MiniSettingsMenu
                                    active={active}
                                    setActive={setActive}
                                />
                            )}

                            {active === "profile" && <AdvSettingsProfile />}
                            {active === "volume" && <AdvSettingsVolume />}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
