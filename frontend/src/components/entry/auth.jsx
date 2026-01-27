import {Link} from "react-router-dom"

import buzzlogo from "../../assets/buzz-logo.svg"

import EntrySwitch from "./entry-switch"
import Input from "../input"

export default function Auth({ active, setActive }) {
    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='large-text text--light'>Авторизация</p>
            <div className='entry-input-block'>
                <Input placeholder="Введите ник"/>
                <Input placeholder="Введите пароль"/>
                <Link to="/start" className='entry-input-btn'>
                    <p className="small-text text--light">Войти</p>
                </Link>
            </div>
            <EntrySwitch active={active} setActive={setActive} />
        </main>
    );
}