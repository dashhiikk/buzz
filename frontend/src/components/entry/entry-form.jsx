import {Link} from "react-router-dom"

import buzzlogo from "../../assets/buzz-logo.svg"

import EntrySwitch from "./entry-switch"
import Input from "../input"

export default function EntryForm({ type, active, setActive }) {
    const config = {
        auth: {
            title: "Авторизация",
            inputs: [
                { placeholder: "Введите ник", autoComplete:"new-username", name: "login_fake" },
                { placeholder: "Введите пароль", type: "password", autoComplete:"new-password", name: "password_fake" },
            ],
            buttonText: "Войти",
            linkTo: "/start",
            linkState: null,
            },
        registration: {
            title: "Регистрация",
            inputs: [
                { placeholder: "Введите ник", autoComplete:"new-username", name: "login_fake" },
                { placeholder: "Введите почту", type: "email", autoComplete:"new-email", name: "email_fake" },
                { placeholder: "Введите пароль", type: "password" },
                { placeholder: "Повторите пароль", type: "password" },
            ],
            buttonText: "Зарегистрироваться",
            linkTo: "/start",
            linkState: { fromRegistration: true },
            },
        recovery: {
            title: "Восстановление пароля",
            inputs: [
                { placeholder: "Введите ник", autoComplete:"new-username", name: "login_fake" },
                { placeholder: "Введите почту", type: "email", autoComplete:"new-email", name: "email_fake" },
            ],
            buttonText: "Получить ссылку",
            linkTo: "/recovery",
            linkState: null,
        },
        newpassword: {
            title: "Восстановление пароля",
            inputs: [
                {placeholder: "Введите новый пароль"},
                {placeholder: "Повторите пароль"},
            ],
            buttonText: "Сохранить",
            linkTo: "/start",
            linkState: {fromRecovery: true}
        },
    };

    const current = config[type];

    return (
        <main className="entry-block">
            <img src={buzzlogo}></img>
            <p className='large-text text--light'>{current.title}</p>
            <div className='entry-input-block'>
                {current.inputs.map((input, index) => (
                    <Input
                        key={index}
                        placeholder={input.placeholder}
                        type={input.type || "text"}
                        autoComplete={input.autoComplete}
                        name={input.name}
                    />
                ))}

                <Link 
                    to={current.linkTo}
                    state={current.linkState}
                    className='entry-input-btn'
                >
                    <p className="small-text text--light">{current.buttonText}</p>
                </Link>
            </div>
            <EntrySwitch active={active} setActive={setActive} />
        </main>
    );
}