import "../css/input.css"

const Input = ({ placeholder, value, onChange, type = "text" }) => {
    return (
        <div className="input">
            <input
                type={type}
                className="input-text text--dark"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default Input;