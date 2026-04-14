import send from "../../../assets/send.svg";
import put from "../../../assets/paperclip.svg";

export default function InputMessage({
    value,
    onChange,
    onKeyDown,
    onSend,
    onAttachClick,
    disabled = false,
    fileInputRef,
    onFileSelect,
}) {
    return (
        <>
            <div className="input-block">
                <textarea
                    placeholder="Введите сообщение..."
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    disabled={disabled}
                />
                <div className="input-icons">
                    <img
                        src={send}
                        onClick={onSend}
                        style={{
                            opacity: disabled ? 0.5 : 1,
                            cursor: disabled ? "not-allowed" : "pointer",
                        }}
                        alt="send"
                    />
                    <img
                        src={put}
                        onClick={onAttachClick}
                        style={{
                            opacity: disabled ? 0.5 : 1,
                            cursor: disabled ? "not-allowed" : "pointer",
                        }}
                        alt="attach"
                    />
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                multiple
                onChange={onFileSelect}
                accept="image/*,video/*,application/pdf"
            />
        </>
    );
}