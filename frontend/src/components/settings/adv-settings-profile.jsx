import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/use-auth"
import { updateProfile, changePassword} from "../../api/users";
import { uploadFile } from '../../api/upload';

import "../../css/settings.css";
import "../../css/right-block.css"

import avatar from "../../assets/user-icon.svg";
import save from "../../assets/save.svg";

import Input from "../input";
import AdvSettingsField from "./adv-settings-field";

export default function AdvSettingsProfile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    code: "",
    phone: "",
    email: "",
    firstName: "",
    birthDate: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [saving, setSaving] = useState(null);
  const [errors, setErrors] = useState({});
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    repeatPassword: "",
  });

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    console.log('Errors updated:', errors);
  }, [errors]);

  useEffect(() => {
    if (user) {
      const newData = {
        username: user.username || "",
        code: user.code || "",
        phone: user.phone ? formatPhone(user.phone) : "",
        email: user.email || "",
        firstName: user.firstName || "",
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : "",
      };
      setFormData(newData);
      setOriginalData(newData);
    }
  }, [user]);

  const handleChange = (field, value) => {
    if (field === "phone") {
      // Форматируем при любом изменении
      const formatted = formatPhone(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    if (field === "username" || field === "code") {
      setErrors(prev => ({ ...prev, usernameCode: undefined }));
    }
  };

  const isFieldChanged = (field) => formData[field] !== originalData[field];

  const handleSaveField = async (field, value) => {
    if (!isFieldChanged(field)) return;
    setSaving(field);
    setErrors(prev => ({ ...prev, [field]: undefined }));
    try {
      await updateUser({ [field]: value });
      setOriginalData(prev => ({ ...prev, [field]: value }));
    } catch (err) {
      const data = err.response?.data;
      if (data && data.errors) {
        setErrors(prev => ({ ...prev, ...data.errors }));
        setFormData(prev => ({ ...prev, [field]: originalData[field] }));
        setSaving(null);
        return;
      } else {
        const message = data?.error || err.message;
        setErrors(prev => ({ ...prev, [field]: message }));
        setFormData(prev => ({ ...prev, [field]: originalData[field] }));
      }
    } finally {
      setSaving(null);
    }
  };

  const handleSaveUsernameAndCode = async () => {
    const usernameChanged = isFieldChanged("username");
    const codeChanged = isFieldChanged("code");
    if (!usernameChanged && !codeChanged) return;
    setSaving("usernameCode");
    setErrors(prev => ({ ...prev, usernameCode: undefined }));
    try {
      const updates = {};
      if (usernameChanged) updates.username = formData.username;
      if (codeChanged) updates.code = formData.code;
      await updateUser(updates);
      // После успешного сохранения обновляем originalData
      setOriginalData(prev => ({ ...prev, ...updates }));
    } catch (err) {
       const responseData = err.response?.data;
        let errorsObj = null;
        let errorMessage = null;

        if (typeof responseData === 'string') {
          const firstJson = responseData.split('\n')[0];
          try {
            const parsed = JSON.parse(firstJson);
            if (parsed.errors) {
              errorsObj = parsed.errors;
            } else if (parsed.error) {
              errorMessage = parsed.error;
            }
          } catch (e) {console.log(e)}
        } else if (responseData && typeof responseData === 'object') {
          if (responseData.errors) {
            errorsObj = responseData.errors;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          }
        }

        if (errorsObj) {
          // Устанавливаем ошибки для конкретных полей (например, code)
          setErrors(prev => ({ ...prev, ...errorsObj }));
        } else if (errorMessage) {
          setErrors(prev => ({ ...prev, usernameCode: errorMessage }));
        } else {
          setErrors(prev => ({ ...prev, usernameCode: err.message }));
        }
        // Восстанавливаем исходные значения
        setFormData(prev => ({
          ...prev,
          username: originalData.username,
          code: originalData.code,
        }));
    } finally {
      setSaving(null);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, avatar: "Можно загружать только изображения" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: "Размер файла не должен превышать 5 МБ" }));
      return;
    }
    setAvatarUploading(true);
    try {
      const response = await uploadFile(file);
      const avatarUrl = response.data.url;
      await updateProfile({ avatar: avatarUrl });
      await updateUser({ avatar: avatarUrl });
    } catch (err) {
      console.log(err)
      setErrors(prev => ({ ...prev, avatar: "Ошибка загрузки аватара" }));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.repeatPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordData({ oldPassword: "", newPassword: "", repeatPassword: "" });
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

 const formatPhone = (value) => {
  // Удаляем все нецифровые символы
  let digits = value.replace(/\D/g, '');
  // Если начинается с 8, заменяем на 7
  if (digits.length === 11 && digits[0] === '8') {
    digits = '7' + digits.slice(1);
  }
  // Ограничиваем 11 цифрами
  if (digits.length > 11) digits = digits.slice(0, 11);
  let formatted = '';
  if (digits.length > 0) formatted = '+7';
  if (digits.length > 1) formatted += ' ' + digits.slice(1, 4);
  if (digits.length > 4) formatted += ' ' + digits.slice(4, 7);
  if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
  if (digits.length > 9) formatted += ' ' + digits.slice(9, 11);
  return formatted;
};

  return (
    <main className="right-block">
      <div className="right-block-header">
        <p className="large-text text--light">Профиль</p>
      </div>
      <div className="adv-settings">
        {/* Ник + аватар */} 
        <div className="adv-settings-input-username">
          <div className="adv-settings-input"> 
            <AdvSettingsField
              label="Ник"
              name="username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              rightSlot={
              <Input
                name="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                autoComplete="code"
                prefix="#"
              />}
              rightSlotType = "code"
            />
            {errors.username && <p className="small-text text--average">{errors.username}</p>}
            {errors.code && <p className="small-text text--average">{errors.code}</p>}
            {errors.usernameCode && <p className="small-text text--average">{errors.usernameCode}</p>}

            <button
              className="adv-settings-save-btn"
              onClick={() => handleSaveUsernameAndCode()}
              disabled={(!isFieldChanged("username") && !isFieldChanged("code")) || saving === "usernameCode"}
            >
              {saving === "usernameCode" ? "Сохранение..." : "Сохранить"}
            </button>
          </div>

          <>
            <label htmlFor="avatar-upload" className="adv-settings-input-img">
              <img src={user?.avatar || avatar} alt="Аватар" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
            {avatarUploading && <p className="small-text text--average">Загрузка...</p>}
            {errors.avatar && <p className="error-message">{errors.avatar}</p>}
          </>

        </div>

        <div className="adv-settings-input-block">
          <div className="adv-settings-input">
            <AdvSettingsField
              label="Телефон"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              autoComplete="tel"
              rightSlot={
                <button 
                  onClick={() => handleSaveField("phone", formData.phone)} 
                  disabled={!isFieldChanged("phone") || saving === "phone"}
                  className="adv-settings-save-btn-mini"
                >
                  <img src={save} alt="Сохранить" />
                </button>
              }
              rightSlotType="button"
            />
            {errors.phone && <p className="small-text text--average">{errors.phone}</p>}
          </div>
          <div className="adv-settings-input">
            <AdvSettingsField
              label="Электронная почта"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              autoComplete="email"
              rightSlot={
                <button 
                  onClick={() => handleSaveField("email", formData.email)}
                  disabled={!isFieldChanged("email") || saving === "email"}
                  className="adv-settings-save-btn-mini"
                >
                  <img src={save} alt="Сохранить" />
                </button>
              }
              rightSlotType = "button"
            />
            {errors.email && <p className="small-text text--average">{errors.email}</p>}
          </div>
          <div className="adv-settings-input">
            <AdvSettingsField
              label="Имя"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              autoComplete="given-name"
              rightSlot={
                <button 
                  onClick={() => handleSaveField("firstName", formData.firstName)}
                  disabled={!isFieldChanged("firstName") || saving === "firstName"}
                  className="adv-settings-save-btn-mini"
                >
                  <img src={save} alt="Сохранить" />
                </button>
              }
              rightSlotType = "button"
            />
            {errors.firstName && <p className="small-text text--average">{errors.firstName}</p>}
          </div>
          <div className="adv-settings-input">
            <AdvSettingsField
              label="Дата рождения"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              autoComplete="bday"
              rightSlot={
                <button 
                  onClick={() => handleSaveField("birthDate", formData.birthDate)}
                  disabled={!isFieldChanged("birthDate") || saving === "birthDate"}
                  className="adv-settings-save-btn-mini"
                >
                  <img src={save} alt="Сохранить" />
                </button>
              }
              rightSlotType = "button"
            />
           {errors.birthDate && <p className="small-text text--average">{errors.birthDate}</p>}
          </div>
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
              value={passwordData.oldPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, oldPassword: e.target.value })
              }
            />
            <Input
              name="newPassword"
              type="password"
              placeholder="Новый пароль"
              autoComplete="new-password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
            />
            <Input
              name="repeatPassword"
              type="password"
              placeholder="Повторите новый пароль"
              autoComplete="new-password"
              value={passwordData.repeatPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, repeatPassword: e.target.value })
              }
            />
            {passwordError && <p className="small-text text--average">{passwordError}</p>}
            <button
              className="adv-settings-save-btn"
              onClick={handlePasswordChange}
              disabled={
                passwordSaving ||
                !passwordData.oldPassword.trim() ||
                !passwordData.newPassword.trim() ||
                !passwordData.repeatPassword.trim()
              }
            >
              {passwordSaving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
