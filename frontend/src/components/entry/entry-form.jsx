import { Link } from "react-router-dom";
import buzzlogo from "../../assets/buzz-logo.svg";
import EntrySwitch from "./entry-switch";
import Input from "../input";

export default function EntryForm({ type, active, setActive }) {
  const config = {
    auth: {
      title: "Авторизация",
      inputs: [
        { id: "login", placeholder: "Введите ник" },
        { id: "password", placeholder: "Введите пароль", type: "password" },
      ],
      buttonText: "Войти",
      linkTo: "/start",
      linkState: null,
    },
    registration: {
      title: "Регистрация",
      inputs: [
        { id: "login", placeholder: "Введите ник" },
        { id: "email", placeholder: "Введите почту", type: "email" },
        { id: "password", placeholder: "Введите пароль", type: "password" },
        { id: "passwordRepeat", placeholder: "Повторите пароль", type: "password" },
      ],
      buttonText: "Зарегистрироваться",
      linkTo: "/start",
      linkState: { fromRegistration: true },
    },
    recovery: {
      title: "Восстановление пароля",
      inputs: [
        { id: "login", placeholder: "Введите ник" },
        { id: "email", placeholder: "Введите почту", type: "email" },
      ],
      buttonText: "Получить ссылку",
      linkTo: "/recovery",
      linkState: null,
    },
    newpassword: {
      title: "Восстановление пароля",
      inputs: [
        { id: "newPassword", placeholder: "Введите новый пароль", type: "password" },
        { id: "repeatPassword", placeholder: "Повторите пароль", type: "password" },
      ],
      buttonText: "Сохранить",
      linkTo: "/start",
      linkState: { fromRecovery: true },
    },
  };

  const current = config[type];

  return (
    <main className="entry-block">
      <img src={buzzlogo} alt="logo" />
      <p className="large-text text--light">{current.title}</p>

      <div className="entry-input-block">
        {current.inputs.map((input) => (
          <Input
            key={`${type}-${input.id}`}
            placeholder={input.placeholder}
            type={input.type || "text"}
          />
        ))}

        <Link to={current.linkTo} state={current.linkState} className="entry-input-btn">
          <p className="small-text text--light">{current.buttonText}</p>
        </Link>
      </div>

      <EntrySwitch active={active} setActive={setActive} />
    </main>
  );
}