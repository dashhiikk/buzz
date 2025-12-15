import "../../css/settings.css"

import avatar from "../../assets/add-avatar.png"
import save from "../../assets/save-icon.png"

export default function AdvSettingsProfile() {
    return (
        <main className="adv-settings-block">
            <div className="adv-settings-header">
                <p>Профиль</p>
            </div>
            <div className="adv-settings-input-block">
                <div className="adv-settings-input-part">
                    <div className="adv-settings-input">
                        <p className="adv-settings-input-header">Ник</p>
                        <div className="adv-settings-input-field">
                            <p className="adv-settings-input-text">Мой ник</p>
                            <div className="adv-settings-input-btn">
                                <p className="adv-settings-input-text">#0000</p>
                            </div>
                        </div>
                    </div>
                    <button className="adv-settings-save-btn">
                        Сохранить
                    </button>
                </div>
                <div className="adv-settings-input-part">
                    <img className="adv-settings-input-img" src={avatar}/>
                    <button className="adv-settings-save-btn">
                        Сохранить
                    </button>
                </div>
            </div>
            <div className="adv-settings-input-block">
                <div className="adv-settings-input-part">
                    <div className="adv-settings-input">
                        <p className="adv-settings-input-header">Телефон</p>
                        <div className="adv-settings-input-field">
                            <p className="adv-settings-input-text">+7 900 899 50 50</p>
                            <div className="adv-settings-input-btn">
                                <img src={save}/>
                            </div>
                        </div>
                    </div>
                    <div className="adv-settings-input">
                        <p className="adv-settings-input-header">Электронная почта</p>
                        <div className="adv-settings-input-field">
                            <p className="adv-settings-input-text">hey@gmail.com</p>
                            <div className="adv-settings-input-btn">
                                <img src={save}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="adv-settings-input-part">
                    <div className="adv-settings-input">
                        <p className="adv-settings-input-header">Имя</p>
                        <div className="adv-settings-input-field">
                            <p className="adv-settings-input-text">Дарья</p>
                            <div className="adv-settings-input-btn">
                                <img src={save}/>
                            </div>
                        </div>
                    </div>
                    <div className="adv-settings-input">
                        <p className="adv-settings-input-header">Дата рождения</p>
                        <div className="adv-settings-input-field">
                            <p className="adv-settings-input-text">10.08.2004</p>
                            <div className="adv-settings-input-btn">
                                <img src={save}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="adv-settings-input-block">
                <div className="adv-settings-input">
                    <p className="adv-settings-input-header">Установить новый пароль</p>
                    <div className="adv-settings-input-field">
                        <p className="adv-settings-input-text">Старый пароль</p>
                    </div>
                    <div className="adv-settings-input-field">
                        <p className="adv-settings-input-text">Новый пароль</p>
                    </div>
                    <div className="adv-settings-input-field">
                        <p className="adv-settings-input-text">Повторите новый пароль</p>
                    </div>

                    <button className="adv-settings-save-btn">
                        Сохранить
                    </button>
                </div>
            </div>
        </main>
    );
}