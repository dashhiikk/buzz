import '../../css/switch.css'

export default function RoomSwitch({ active, setActive }) {
    return (
    <div className="switch">
      <div
        className={`start-switch-btn-left ${active === "voice" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("voice")}
      >
        <p>Голосовой чат</p>
      </div>
      <div
        className={`start-switch-btn-right ${active === "members" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("members")}
      >
        <p>Участники</p>
      </div>
    </div>
  );
}