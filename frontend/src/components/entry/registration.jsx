import {Link} from "react-router-dom"

import buzzlogo from "../../assets/buzz-logo.png"

import EntrySwitch from "./entry-switch"

export default function Registation({ active, setActive }) {
    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='entry-header'>Регистрация</p>
            <div className='entry-input-block'>
                <div className='entry-input'>
                    <p>Введите ник</p>
                </div>
                <div className='entry-input'>
                    <p>Введите почту</p>
                </div>
                <div className='entry-input'>
                    <p>Введите пароль</p>
                </div>
                <div className='entry-input'>
                    <p>Повторите пароль</p>
                </div>
                <Link to="/start" className='entry-input-btn'>
                    <p>Зарегистрироваться</p>
                </Link>
            </div>
            <EntrySwitch active={active} setActive={setActive} />
        </main>
    );
}