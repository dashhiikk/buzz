import buzzlogo from "../../assets/buzz-logo.svg";
import apiClient from "../../api/client"
import { useState, useEffect} from "react";
import { useAuth } from "../../hooks/use-auth";

export default function SuccessMessage({ title, message, email, onResend, onBack, isRegistration }) {
  const { user } = useAuth();
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState("");
 
  const handleCancel = async () => {
    try {
      setError("");
      await apiClient.post("/auth/register/cancel", { email });
      onBack(); 
    } catch (err) {
      console.error(err);
      setError("Не удалось отменить регистрацию");
    }
  };


  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'emailVerified') {
        setEmailVerified(true);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <main className="entry-block">
      <img src={buzzlogo} alt="logo" />
      <p className="large-text text--light">{title}</p>
      {!user && !emailVerified && ( 
        <div className="entry-input-block">
          <p className="medium-text text--light">На почту <strong>{email}</strong> {message}</p>
          {error && <p className="small-text text--average">{error}</p>}
          <button onClick={onResend} className="entry-input-btn">Отправить повторно</button>
          {isRegistration && (
            <button onClick={handleCancel} className="entry-input-btn">
              Отменить отправку
            </button>
          )}
          {!isRegistration && (
            <button onClick={onBack} className="entry-input-btn">Вернуться ко входу</button>
          )}
        </div>
      )}
      {emailVerified && (
        <div className="entry-input-block">
          <p className="medium-text text--light">Email подтверждён. Вы можете закрыть это окно.</p>
        </div>
      )}

    </main>
  );
}
