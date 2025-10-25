import { useState } from "react";

import Header from "../components/header"
import Auth from "../components/auth"
import Recovery from "../components/recovery";
import Registration from "../components/registration"

export default function Entry() {

    const [active, setActive] = useState("auth");

    return (
        <main>
            <Header/>
            {active === "auth" && <Auth active={active} setActive={setActive} />}
            {active === "recovery" && <Recovery active={active} setActive={setActive} />}
            {active === "registration" && <Registration active={active} setActive={setActive} />}
        </main>
    );
}