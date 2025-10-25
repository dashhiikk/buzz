import '../css/switch.css'

export default function EntrySwitch({ active, setActive }) {
  console.log("Active:", active);
  return (
    <div className="entry-switch">
      <div
        className={`entry-switch-btn-left ${active === "recovery" ? "entry-switch-btn-active" : ""}`}
        onClick={() => setActive("recovery")}
      >
        <p>Забыл пароль</p>
      </div>
      <div
        className={`entry-switch-btn-center ${active === "auth" ? "entry-switch-btn-active" : ""}`}
        onClick={() => setActive("auth")}
      >
        <p>Вход</p>
      </div>
      <div
        className={`entry-switch-btn-right ${active === "registration" ? "entry-switch-btn-active" : ""}`}
        onClick={() => setActive("registration")}
      >
        <p>Регистрация</p>
      </div>
    </div>
  );
}