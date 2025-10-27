import '../../css/switch.css'

export default function StartSwitch({ active, setActive }) {
  console.log("Active:", active);
  return (
    <div className="switch">
      <div
        className={`start-switch-btn-left ${active === "friend" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("friend")}
      >
        <p>Друзья</p>
      </div>
      <div
        className={`start-switch-btn-right ${active === "room" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("room")}
      >
        <p>Комнаты</p>
      </div>
    </div>
  );
}