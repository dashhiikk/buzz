import "../../css/settings.css";
import Input from "../input";

export default function AdvSettingsField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete = "off",
  rightSlot = null, // сюда передаём кнопку / иконку
}) {
  return (
    <div className="adv-settings-input">
      <p className="medium-text text--light">{label}</p>

      <div className="adv-settings-input-field">
        <Input
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />

        {rightSlot && (
          <div className="adv-settings-input-btn">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}