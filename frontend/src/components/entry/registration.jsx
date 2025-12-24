import { Link } from "react-router-dom";
import buzzlogo from "../../assets/buzz-logo.svg"

import EntrySwitch from "./entry-switch"

export default function Registation({ active, setActive }) {

    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='large-text text--light'>Регистрация</p>
            <div className='entry-input-block'>
                <div className='entry-input'>
                    <p className="input-text text--dark">Введите ник</p>
                </div>
                <div className='entry-input'>
                    <p className="input-text text--dark">Введите почту</p>
                </div>
                <div className='entry-input'>
                    <p className="input-text text--dark">Введите пароль</p>
                </div>
                <div className='entry-input'>
                    <p className="input-text text--dark">Повторите пароль</p>
                </div>
                <Link
                    to="/start"
                    state={{ fromRegistration: true }} // <-- state напрямую, НЕ в объекте
                    className="entry-input-btn"
                >
                    <p className="small-text text--light">Зарегистрироваться</p>
                </Link>
            </div>
            <EntrySwitch active={active} setActive={setActive} />
        </main>
    );
}