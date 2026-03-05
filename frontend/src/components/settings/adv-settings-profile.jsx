import "../../css/settings.css";
import "../../css/right-block.css"

import avatar from "../../assets/add-avatar.png";
import save from "../../assets/save-icon.png";

import Input from "../input";
import AdvSettingsField from "./adv-settings-field";

export default function AdvSettingsProfile() {
  return (
    <main className="right-block">
      <div className="right-block-header">
        <p className="large-text text--light">Профиль</p>
      </div>

      {/* Ник + аватар */} 
      <div className="adv-settings-input-block">
        <>
          <AdvSettingsField
            label="Ник"
            name="username"
            placeholder="Мой ник"
            autoComplete="username"
            rightSlot={
            <Input
              name="code"
              placeholder="#0000"
              autoComplete="code"
            />}
          />
          <button className="adv-settings-save-btn">
            Сохранить
          </button>
        </>

        <>
          <img className="adv-settings-input-img" src={avatar} alt="Аватар" />
          <button className="adv-settings-save-btn">
            Сохранить
          </button>
        </>

      </div>

      <div className="adv-settings-input-block">
        <AdvSettingsField
          label="Телефон"
          name="phone"
          type="tel"
          placeholder="+7 900 899 50 50"
          autoComplete="tel"
          rightSlot={<img src={save} alt="Сохранить" />}
        />

        <AdvSettingsField
          label="Электронная почта"
          name="email"
          type="email"
          placeholder="hey@gmail.com"
          autoComplete="email"
          rightSlot={<img src={save} alt="Сохранить" />}
        />

        <AdvSettingsField
          label="Имя"
          name="firstName"
          placeholder="Дарья"
          autoComplete="given-name"
          rightSlot={<img src={save} alt="Сохранить" />}
        />

        <AdvSettingsField
          label="Дата рождения"
          name="birthDate"
          type="date"
          placeholder="10.08.2004"
          autoComplete="bday"
          rightSlot={<img src={save} alt="Сохранить" />}
        />
      </div>

      {/* Смена пароля */}
      <div className="adv-settings-input-block">
        <div className="adv-settings-input">
          <p className="medium-text text--light">Установить новый пароль</p>
          <Input
            name="oldPassword"
            type="password"
            placeholder="Старый пароль"
            autoComplete="current-password"
          />
          <Input
            name="newPassword"
            type="password"
            placeholder="Новый пароль"
            autoComplete="new-password"
          />
          <Input
            name="repeatPassword"
            type="password"
            placeholder="Повторите новый пароль"
            autoComplete="new-password"
          />
          <button className="adv-settings-save-btn">
            Сохранить
          </button>
        </div>
      </div>
    </main>
  );
}
