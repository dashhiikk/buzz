import "../../css/settings.css";
import Input from "../input";

export default function AdvSettingsField({
  label,
  name,
  type = "text",
  value,
  placeholder,
  onChange,
  autoComplete = "off",
  rightSlot = null, // сюда передаём кнопку / иконку
  rightSlotType
}) {
  return (
    <div>
      <p className="medium-text text--light">{label}</p>
      <div className={`adv-settings-input-field ${rightSlotType === "code" ? "code-slot" : "button-slot"}`}>
        <Input
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
        />
        {rightSlot && (
            <>{rightSlot}</>
        )}
      </div>
    </div>
  );
}