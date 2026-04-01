import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";
import buzzlogo from "../../assets/buzz-logo.svg";
import EntrySwitch from "./entry-switch";
import Input from "../input";
import apiClient from "../../api/client"
import SuccessMessage from "./success-message"

const validateForm = (type, data) => {
  if (type === "auth") {
    if (!data.email || !data.password) return "Заполните все поля";
  } else if (type === "registration") {
    if (!data.login || !data.email || !data.password || !data.passwordRepeat) return "Заполните все поля";
    if (data.password !== data.passwordRepeat) return "Пароли не совпадают";
  } else if (type === "recovery") {
    if (!data.email) return "Введите email";
  }
  return null;
};

export default function EntryForm({
  type,
  active,
  setActive,
  registrationSuccess,
  setRegistrationSuccess,
  registeredEmail,
  setRegisteredEmail,
  recoverySuccess,
  setRecoverySuccess,
  recoveryEmail,
  setRecoveryEmail 
}) {
  const navigate = useNavigate();
  const { login, register,  requestPasswordReset} = useAuth();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resendVerification = async () => {
    try {
      await apiClient.post('/auth/resend-verification', { email: registeredEmail });
      alert("Письмо отправлено повторно");
    } catch (err) {
      console.error(err);
      alert("Не удалось отправить письмо");
    }
  };

  const resendRecovery = async () => {
    try {
      await requestPasswordReset(recoveryEmail);
      alert("Письмо отправлено повторно");
    } catch (err) {
      console.error(err);
      alert("Не удалось отправить письмо");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log('formData on submit:', formData);
    const validationError = validateForm(type, formData);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      if (type === "auth") {
        const { email, password } = formData;
        await login(email, password);
        navigate("/start", { replace: true });

      } else if (type === "registration") {
        const { login: username, email, password} = formData;
        await register(username, email, password);
        setRegisteredEmail(email);
        setRegistrationSuccess(true);
      }  else if (type === "recovery") {
        const { email } = formData;
        await requestPasswordReset(email);
        setRecoveryEmail(email);
        setRecoverySuccess(true);
      }
    } catch (err) {
      setError(err.message || "Ошибка при выполнении запроса");
    } finally {
      setLoading(false);
    }
  };

  const config = {
    auth: {
      title: "Авторизация",
      inputs: [
        { name: "email", placeholder: "Введите почту", type: "email", autoComplete: "off" },
        { name: "password", placeholder: "Введите пароль", type: "password", autoComplete: "off" },
      ],
      buttonText: "Войти", 
    },
    registration: {
      title: "Регистрация",
      inputs: [
        { name: "login", placeholder: "Введите ник", autoComplete: "off" },
        { name: "email", placeholder: "Введите почту", type: "email", autoComplete: "off" },
        { name: "password", placeholder: "Введите пароль", type: "password", autoComplete: "off" },
        { name: "passwordRepeat", placeholder: "Повторите пароль", type: "password", autoComplete: "off" },
      ],
      buttonText: "Зарегистрироваться",
    },
    recovery: {
      title: "Восстановление пароля",
      inputs: [
        { name: "email", placeholder: "Введите почту", type: "email", autoComplete: "off" },
      ],
      buttonText: "Получить ссылку",
    },
  };

  if (registrationSuccess) {
    return (
      <SuccessMessage
        title="Подтверждение email"
        message="отправлено письмо со ссылкой для подтверждения."
        email={registeredEmail}
        onResend={resendVerification}
        onBack={() => { setRegistrationSuccess(false); setActive("auth"); }}
        isRegistration={true}
      />
    );
  }

  if (recoverySuccess) {
    return (
      <SuccessMessage
        title="Восстановление пароля"
        message="отправлена ссылка для сброса пароля."
        email={recoveryEmail}
        onResend={resendRecovery}
        onBack={() => { setRecoverySuccess(false); setActive("auth"); }}
        isRegistration={false}
      />
    );
  }

  const current = config[type];
  if (!current) return null;

  return (
    <main className="entry-block">
      <img src={buzzlogo} alt="logo" />
      <p className="large-text text--light">{current.title}</p>

      {error && <p className="small-text text--average">{error}</p>}

      <form onSubmit={handleSubmit} className="entry-input-block">
        {current.inputs.map((input) => (
          <Input
            key={`${type}-${input.name}`}
            placeholder={input.placeholder}
            type={input.type || "text"}
            autoComplete={input.autoComplete}
            name={input.name}
            value={formData[input.name] || ""}
            onChange={handleChange}
          />
        ))}

        <button type="submit" disabled={loading} className="entry-input-btn">
          <p>{loading ? "Загрузка..." : current.buttonText}</p>
        </button>
      </form>

      <EntrySwitch active={active} setActive={setActive} />
    </main>
  );
}
