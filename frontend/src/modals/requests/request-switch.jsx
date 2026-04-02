import '../../css/switch.css'

export default function RequestsSwitch({ active, setActive }) {
  return (
    <div className="switch">
      <div
        className={`start-switch-btn-left switch-light ${active === "incoming" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("incoming")}
      >
        <p>Входящие</p>
      </div>
      <div
        className={`start-switch-btn-right switch-light ${active === "outgoing" ? "switch-btn-active" : ""}`}
        onClick={() => setActive("outgoing")}
      >
        <p>Исходящие</p>
      </div>
    </div>
  );
}