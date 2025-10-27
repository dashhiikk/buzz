import buzzlogo from "../../assets/buzz-logo.png"

import EntrySwitch from "./entry-switch"

import {Link} from "react-router-dom"

export default function Recovery({ active, setActive }) {

    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='entry-header'>Восстановление пароля</p>
            <div className='entry-input-block'>
                <div className='entry-input'>
                    <p>Введите ник</p>
                </div>
                <div className='entry-input'>
                    <p>Введите почту</p>
                </div>
                <Link to="/recovery" className='entry-input-btn'>
                    <p>Получить ссылку</p>
                </Link>
            </div>
            <EntrySwitch active={active} setActive={setActive} />
        </main>
    );
}