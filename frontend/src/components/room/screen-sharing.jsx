import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import expand from "../../assets/expand.svg"
import minimize from "../../assets/minimize.svg"
import close from "../../assets/close-screen.svg"
import screen from "../../assets/screen.jpg"
import chat from "../../assets/chat.svg"

import "../../css/room/screen-share.css"
import "../../css/page/transition-btn.css"

const CARD_ANIMATION_MS = 280;
const OVERLAY_ANIMATION_MS = 220;

export default function ScreenShare({ 
    onClose,
    sharerName = "Пользователь"
}) {
    const [cardVisible, setCardVisible] = useState(false);
    const [overlayMounted, setOverlayMounted] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);

    const closeTimerRef = useRef(null);
    const overlayTimerRef = useRef(null);

    useEffect(() => {
        const rafId = requestAnimationFrame(() => {
            setCardVisible(true);
        });

        return () => {
            cancelAnimationFrame(rafId);
            clearTimeout(closeTimerRef.current);
            clearTimeout(overlayTimerRef.current);
        };
    }, []);

   

    const handleExpand = () => {
        if (overlayMounted) return;

        setOverlayMounted(true);

        requestAnimationFrame(() => {
            setOverlayVisible(true);
        });
    };

    const handleMinimize = () => {
        setOverlayVisible(false);

        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = setTimeout(() => {
            setOverlayMounted(false);
        }, OVERLAY_ANIMATION_MS);
    };

    const handleClose = () => {
        if (overlayMounted) {
            setOverlayVisible(false);

            clearTimeout(overlayTimerRef.current);
            overlayTimerRef.current = setTimeout(() => {
                setOverlayMounted(false);
                setCardVisible(false);

                clearTimeout(closeTimerRef.current);
                closeTimerRef.current = setTimeout(() => {
                    onClose?.();
                }, CARD_ANIMATION_MS);
            }, OVERLAY_ANIMATION_MS);

            return;
        }

        setCardVisible(false);

        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = setTimeout(() => {
            onClose?.();
        }, CARD_ANIMATION_MS);
    };

    const inlineCard = (
        <div className={`screen-share ${cardVisible ? "is-visible" : ""}`}>
            <div className="screen-share-media">
                <img
                    className="screen"
                    src={screen}
                    alt="Демонстрация экрана"
                />
            </div>

            <button
                className="screen-close-btn"
                type="button"
                onClick={handleClose}
            >
                <img src={close} alt="Закрыть демонстрацию" />
            </button>

            <div className="screen-share-controls">
                <button
                    className="screen-size-btn"
                    type="button"
                    onClick={handleExpand}
                >
                    <img src={expand} alt="Развернуть" />
                </button>
            </div>
        </div>
    );

    const expandedCard = (
        <div className={`screen-share-overlay ${overlayVisible ? "is-visible" : ""}`}>
            <div className="screen-share screen-share--expanded">
                <div className="screen-share-media">
                    <img
                        className="screen"
                        src={screen}
                        alt="Демонстрация экрана"
                    />
                </div>

                <button
                    className="screen-close-btn"
                    type="button"
                    onClick={handleClose}
                >
                    <img src={close} alt="Закрыть демонстрацию" />
                </button>

                <div className="screen-share-controls">
                    <button
                        className="screen-size-btn"
                        type="button"
                        onClick={handleMinimize}
                    >
                        <img src={minimize} alt="Свернуть" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <main className="right-block-content">
            <button
                className="to-right-switch-btn"
                type="button"
                onClick={onClose}
            >
                <img src={chat} alt="Открыть чат" />
            </button>

            <div className="right-block-header">
                <p className="medium-text text--light">
                    {sharerName} демонстрирует экран
                </p>
            </div>

            {inlineCard}

            {overlayMounted &&
                createPortal(expandedCard, document.body)}
        </main>
    );
}