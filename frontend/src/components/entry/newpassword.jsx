import {Link} from "react-router-dom"

import buzzlogo from "../../assets/buzz-logo.svg"

import Input from "../input"

export default function NewPassword() {
    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='large-text text--light'>Восстановление пароля</p>
            <div className='entry-input-block'>
                <Input placeholder="Введите новый пароль"/>
                <Input placeholder="Повторите пароль"/>
                <Link 
                    to="/start"
                    state={{ fromRecovery: true }}
                    className='entry-input-btn'
                >
                    <p className="small-text text--light">Сохранить</p>
                </Link>
            </div>
        </main>
    );
}