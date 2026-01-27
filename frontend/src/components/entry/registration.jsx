import { Link } from "react-router-dom";
import buzzlogo from "../../assets/buzz-logo.svg"

import EntrySwitch from "./entry-switch"
import Input from "../input"

export default function Registation({ active, setActive }) {

    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='large-text text--light'>Регистрация</p>
            <div className='entry-input-block'>
                <Input placeholder="Введите ник"/>
                <Input placeholder="Введите почту" type="email"/>
                <Input placeholder="Введите пароль"/>
                <Input placeholder="Повторите пароль"/>
                <Link
                    to="/start"
                    state={{ fromRegistration: true }}
                    className="entry-input-btn"
                >
                    <p className="small-text text--light">Зарегистрироваться</p>
                </Link>
            </div>
            <EntrySwitch active={active} setActive={setActive} />
        </main>
    );
}