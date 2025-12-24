import {Link} from "react-router-dom"

import buzzlogo from "../../assets/buzz-logo.svg"

export default function NewPassword() {
    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='large-text text--light'>Восстановление пароля</p>
            <div className='entry-input-block'>
                <div className='entry-input'>
                    <p className="input-text text--dark">Введите новый пароль</p>
                </div>
                <div className='entry-input'>
                    <p className="input-text text--dark">Повторите пароль</p>
                </div>
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