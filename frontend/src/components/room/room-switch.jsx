import '../../css/switch.css'

export default function RoomSwitch({ active, setActive }) {
    return (
    <div className="switch">
      <div
        className={`start-switch-btn-left ${active === "voice" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("friend")}
      >
        <p>Голосовой чат</p>
      </div>
      <div
        className={`start-switch-btn-right ${active === "members" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("room")}
      >
        <p>Участники</p>
      </div>
    </div>
  );
}