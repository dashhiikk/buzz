import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import expand from "../../assets/expand.svg";
import minimize from "../../assets/minimize.svg";
import close from "../../assets/close-screen.svg";
import screen from "../../assets/screen.jpg";

import "../../css/room/screen-share.css";

const CARD_ANIMATION_MS = 280;
const OVERLAY_ANIMATION_MS = 220;

function ParticipantVideoStrip({ participantVideos = [] }) {
    const stripRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        const el = stripRef.current;
        if (!el) return;

        let rafId = 0;

        const updateScrollState = () => {
            const maxScrollLeft = el.scrollWidth - el.clientWidth;
            setCanScrollLeft(el.scrollLeft > 1);
            setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
        };

        const scheduleUpdate = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateScrollState);
        };

        scheduleUpdate();

        el.addEventListener("scroll", updateScrollState);
        window.addEventListener("resize", scheduleUpdate);

        const resizeObserver = new ResizeObserver(scheduleUpdate);
        resizeObserver.observe(el);

        return () => {
            cancelAnimationFrame(rafId);
            el.removeEventListener("scroll", updateScrollState);
            window.removeEventListener("resize", scheduleUpdate);
            resizeObserver.disconnect();
        };
    }, [participantVideos]);

    const scrollByAmount = (direction) => {
        const el = stripRef.current;
        if (!el) return;

        const amount = Math.max(180, el.clientWidth * 0.6);
        el.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    if (!participantVideos.length) return null;

    return (
        <div className="screen-share-strip">
            {canScrollLeft && (
                <button
                    type="button"
                    className="screen-share-strip-arrow screen-share-strip-arrow--left"
                    onClick={() => scrollByAmount("left")}
                    aria-label="Прокрутить влево"
                >
                    ‹
                </button>
            )}

            <div
                ref={stripRef}
                className="screen-share-strip-track"
            >
                {participantVideos.map((item) => (
                    <div
                        key={item.id}
                        className="screen-share-strip-item"
                        title={item.title || "Участник"}
                    >
                        {item.src ? (
                            <img
                                src={item.src}
                                alt={item.title || "Участник"}
                                className="screen-share-strip-media"
                            />
                        ) : (
                            <div className="screen-share-strip-placeholder" />
                        )}

                        <div className="screen-share-strip-label">
                            {item.title || "Участник"}
                        </div>
                    </div>
                ))}
            </div>

            {canScrollRight && (
                <button
                    type="button"
                    className="screen-share-strip-arrow screen-share-strip-arrow--right"
                    onClick={() => scrollByAmount("right")}
                    aria-label="Прокрутить вправо"
                >
                    ›
                </button>
            )}
        </div>
    );
}

export default function ScreenShare({
    onClose,
    sharerName = "Пользователь",
    participantVideos = [],
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
        <div className={`screen-share-content ${cardVisible ? "is-visible" : ""}`}>
            <div className="screen-share">
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
            <ParticipantVideoStrip participantVideos={participantVideos} />
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
        <>
            <div className="right-block-header">
                <p className="medium-text text--light">
                    {sharerName} демонстрирует экран
                </p>
            </div>

            {inlineCard}

            {overlayMounted && createPortal(expandedCard, document.body)}
        </>
    );
}