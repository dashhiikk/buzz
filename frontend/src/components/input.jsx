import "../css/input.css"

const Input = ({ placeholder, value, onChange, type = "text", autoComplete = "off", name }) => {
    return (
        <div className="input">
            <input
                type={type}
                className="input-text text--dark"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                name={name}
            />
        </div>
    );
};

export default Input;