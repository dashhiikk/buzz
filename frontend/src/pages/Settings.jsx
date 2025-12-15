import Header from "../components/header";
import AdvSettingsMenu from "../components/settings/adv-settings-menu";
import AdvSettingsProfile from "../components/settings/adv-settings-profile";
import AdvSettingsVolume from "../components/settings/adv-settings-volume";
import { useState } from "react";


export default function SettingsPage () {

    const [active, setActive] = useState("profile");

    return (
        <main >
            <Header/>
            <div className="page">
                <AdvSettingsMenu setActive={setActive}/>
                {active === "profile" &&  <AdvSettingsProfile/>}
                {active === "volume" && <AdvSettingsVolume/>}
            </div>
        </main>
    )
}
