import buzzlogo from "../../assets/buzz-logo.svg"

import EntrySwitch from "./entry-switch"
import Input from "../input"

import {Link} from "react-router-dom"

export default function Recovery({ active, setActive }) {

    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='large-text text--light'>Восстановление пароля</p>
            <div className='entry-input-block'>
                <Input placeholder="Введите ник"/>
                <Input placeholder="Введите почту" type="email"/>
                <Link to="/recovery" className='entry-input-btn'>
                    <p className="small-text text--light">Получить ссылку</p>
                </Link>
            </div>
            <EntrySwitch active={active} setActive={setActive} />
        </main>
    );
}