import { useState, useEffect } from 'react';
import '../../../../css/notification.css';

export default function Notification({ message, duration = 2500, onClose }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Небольшая задержка перед появлением (чтобы вмонтировать в DOM)
        const showTimer = setTimeout(() => setIsVisible(true), 10);
        const hideTimer = setTimeout(() => setIsVisible(false), duration);
        const removeTimer = setTimeout(() => {
            if (onClose) onClose();
        }, duration + 400); // даём время на анимацию исчезновения

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
            clearTimeout(removeTimer);
        };
    }, [duration, onClose]);

    return (
        <div className={`notification ${isVisible ? 'show' : 'hide'}`}>
            <p className="small-text text--light">{message}</p>
        </div>
    );
}