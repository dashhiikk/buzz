import { useState } from "react";

import Header from "../components/header"
import EntryForm from "../components/entry/entry-form";

import '../css/entry.css'

export default function Entry() {

    const [active, setActive] = useState("auth");

    return (
        <main>
            <Header hideIconsAndLogo={true}/>
            <EntryForm
                type={active}
                active={active}
                setActive={setActive}
            />
        </main>
    );
}