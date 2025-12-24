import { useState } from "react";

import Header from "../components/header"
import Auth from "../components/entry/auth"
import Recovery from "../components/entry/recovery";
import Registration from "../components/entry/registration"

import '../css/entry.css'

export default function Entry() {

    const [active, setActive] = useState("auth");

    return (
        <main>
            <Header hideIconsAndLogo={true}/>
            {active === "auth" && <Auth active={active} setActive={setActive} />}
            {active === "recovery" && <Recovery active={active} setActive={setActive} />}
            {active === "registration" && <Registration active={active} setActive={setActive} />}
        </main>
    );
}