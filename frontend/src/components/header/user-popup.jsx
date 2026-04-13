import {useAuth} from "../../hooks/use-auth"
import { useEffect, useState } from "react";
import '../../css/user-popup.css'

import requestsIcon from "../../assets/request.svg"

export default function UserPopup({onOpenRequests}) {
    const { user, logout } = useAuth();
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // через кадр после рендера добавляем класс open
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const handleCopy = async () => {
        const textToCopy = `${user?.username ?? ""}#${user?.code ?? ""}`;

        if (!textToCopy || textToCopy === "#") return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error("Ошибка копирования:", error);
        }
    };
    
    return (
    <div className={`user-case ${visible ? "open" : ""}`}>
        <div className="user-block">
            <div className="user-header">
                <p className="medium-text text--light">{user?.username}#{user?.code}</p>
                <div className="divider"></div>
                <p 
                    className="small-text text--average copy-link" 
                    onClick={handleCopy} 
                    style={{ cursor: "pointer" }}
                >
                    {copied ? "скопировано" : "скопировать"}
                </p>
            </div>

            <div className="actions">
                <button className="request-btn" onClick={onOpenRequests} >
                    <img 
                        src={requestsIcon} 
                        alt="requests"
                    />
                </button>
                <button className="logout-btn" onClick={logout}>
                    Выйти
                </button>
            </div>
            
        </div>
    </div>
  );
}