import '../../css/switch.css'

export default function EntrySwitch({ active, setActive }) {
  console.log("Active:", active);
  return (
    <div className="switch">
      <div
        className={`entry-switch-btn-left ${active === "recovery" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("recovery")}
      >
        <p className='small-text'>Забыл пароль</p>
      </div>
      <div
        className={`entry-switch-btn-center ${active === "auth" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("auth")}
      >
        <p className='small-text'>Вход</p>
      </div>
      <div
        className={`entry-switch-btn-right ${active === "registration" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("registration")}
      >
        <p className='small-text'>Регистрация</p>
      </div>
    </div>
  );
}