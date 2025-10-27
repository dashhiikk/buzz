import {Link} from "react-router-dom"

import buzzlogo from "../../assets/buzz-logo.png"

export default function NewPassword() {
    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='entry-header'>Восстановление пароля</p>
            <div className='entry-input-block'>
                <div className='entry-input'>
                    <p>Введите новый пароль</p>
                </div>
                <div className='entry-input'>
                    <p>Повторите пароль</p>
                </div>
                <Link to="/start" className='entry-input-btn'>
                    <p>Сохранить</p>
                </Link>
            </div>
        </main>
    );
}