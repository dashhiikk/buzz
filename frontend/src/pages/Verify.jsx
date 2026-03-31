import { useEffect, useState } from "react";
import { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {useAuth} from "../hooks/use-auth"

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, openRegistrationModal } = useAuth();

  const [status, setStatus] = useState("Проверка...");
  const calledRef = useRef(false);
  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    
    if (!token) {
      setStatus("Токен отсутствует!");
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("Email подтверждён! Вы вошли в систему...");
        openRegistrationModal();
        localStorage.setItem("emailVerified", Date.now());
        setTimeout(() => navigate("/start", { replace: true }), 1500);
      } catch (err) {
        console.error('Failed to verify user:', err);
        setStatus(err.message || "Ссылка недействительна или токен истёк");
      }
    };

    verify();
  }, [location.search, navigate, verifyEmail, openRegistrationModal]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p className="large-text text--dark">{status}</p>
    </div>
  );
}