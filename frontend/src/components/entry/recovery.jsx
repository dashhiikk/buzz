import buzzlogo from "../../assets/buzz-logo.svg"

import EntrySwitch from "./entry-switch"

import {Link} from "react-router-dom"

export default function Recovery({ active, setActive }) {

    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='large-text text--light'>Восстановление пароля</p>
            <div className='entry-input-block'>
                <div className='entry-input'>
                    <p className="input-text text--dark">Введите ник</p>
                </div>
                <div className='entry-input'>
                    <p className="input-text text--dark">Введите почту</p>
                </div>
                <Link to="/recovery" className='entry-input-btn'>
                    <p className="small-text text--light">Получить ссылку</p>
                </Link>
            </div>
            <EntrySwitch active={active} setActive={setActive} />
        </main>
    );
}