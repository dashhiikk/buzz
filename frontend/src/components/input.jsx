import "../css/input.css";

export default function Input({ placeholder, type = "text" }) {
  return (
    <div className="input">
      <input
        type={type}
        className="input-text text--dark"
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}