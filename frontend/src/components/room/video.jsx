import { useEffect, useMemo, useRef, useState } from "react";

import expand from "../../assets/expand.svg";
import minimize from "../../assets/minimize.svg";
import placeholderVideo from "../../assets/screen.jpg";

import "../../css/room/video-chat.css";
import "../../css/page/transition-btn.css";

function VideoTile({
    item,
    isExpanded = false,
    isCompact = false,
    onToggleExpand,
}) {
    return (
        <div
            className={[
                "video-tile",
                isExpanded ? "video-tile--expanded" : "",
                isCompact ? "video-tile--compact" : "",
            ].join(" ")}
        >
            <img
                className="video-tile-media"
                src={item.src || placeholderVideo}
                alt={item.title || "video"}
            />

            <div className="video-tile-label">
                {item.title || "Участник"}
            </div>

            <button
                className="video-size-btn"
                type="button"
                onClick={() => onToggleExpand(item.id)}
            >
                <img
                    className="video-share-media"
                    src={isExpanded ? minimize : expand}
                    alt={isExpanded ? "Свернуть" : "Развернуть"}
                />
            </button>
        </div>
    );
}

export default function VideoChat({
    videos: initialVideos = [],
}) {
    const [videos, setVideos] = useState(initialVideos);
    const [expandedVideoId, setExpandedVideoId] = useState(null);

    const stripRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        setVideos(initialVideos);
    }, [initialVideos]);

    useEffect(() => {
        if (!expandedVideoId) return;

        const exists = videos.some((video) => video.id === expandedVideoId);
        if (!exists) {
            setExpandedVideoId(null);
        }
    }, [videos, expandedVideoId]);

    const expandedVideo = useMemo(
        () => videos.find((video) => video.id === expandedVideoId) || null,
        [videos, expandedVideoId]
    );

    const smallVideos = useMemo(() => {
        if (!expandedVideoId) return videos;
        return videos.filter((video) => video.id !== expandedVideoId);
    }, [videos, expandedVideoId]);

    const handleToggleExpand = (id) => {
        setExpandedVideoId((prev) => (prev === id ? null : id));
    };

    const updateStripScrollState = () => {
        const el = stripRef.current;
        if (!el) return;

        const maxScrollLeft = el.scrollWidth - el.clientWidth;
        setCanScrollLeft(el.scrollLeft > 1);
        setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
    };

    useEffect(() => {
        updateStripScrollState();
    }, [smallVideos, expandedVideoId]);

    useEffect(() => {
        const el = stripRef.current;
        if (!el) return;

        let rafId = 0;

        const scheduleUpdate = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateStripScrollState);
        };

        el.addEventListener("scroll", updateStripScrollState);
        window.addEventListener("resize", scheduleUpdate);

        const resizeObserver = new ResizeObserver(scheduleUpdate);
        resizeObserver.observe(el);

        return () => {
            cancelAnimationFrame(rafId);
            el.removeEventListener("scroll", updateStripScrollState);
            window.removeEventListener("resize", scheduleUpdate);
            resizeObserver.disconnect();
        };
    }, [expandedVideoId]);

    const scrollStrip = (direction) => {
        const el = stripRef.current;
        if (!el) return;

        const amount = Math.max(200, el.clientWidth * 0.65);

        el.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    return (
        <>

            <div className="right-block-header">
                <p className="medium-text text--light">Видео-чат</p>
            </div>

            <div className="video-chat">
                {!expandedVideo && (
                    <div className="video-chat-grid">
                        {smallVideos.map((item) => (
                            <VideoTile
                                key={item.id}
                                item={item}
                                onToggleExpand={handleToggleExpand}
                            />
                        ))}
                    </div>
                )}

                {expandedVideo && (
                    <>
                        <div className="video-chat-featured">
                            <VideoTile
                                item={expandedVideo}
                                isExpanded
                                onToggleExpand={handleToggleExpand}
                            />
                        </div>

                        {smallVideos.length > 0 && (
                            <div className="video-chat-strip-wrapper">
                                {canScrollLeft && (
                                    <button
                                        type="button"
                                        className="video-chat-strip-arrow video-chat-strip-arrow--left"
                                        onClick={() => scrollStrip("left")}
                                        aria-label="Прокрутить влево"
                                    >
                                        ‹
                                    </button>
                                )}

                                <div
                                    ref={stripRef}
                                    className="video-chat-strip"
                                >
                                    {smallVideos.map((item) => (
                                        <VideoTile
                                            key={item.id}
                                            item={item}
                                            isCompact
                                            onToggleExpand={handleToggleExpand}
                                        />
                                    ))}
                                </div>

                                {canScrollRight && (
                                    <button
                                        type="button"
                                        className="video-chat-strip-arrow video-chat-strip-arrow--right"
                                        onClick={() => scrollStrip("right")}
                                        aria-label="Прокрутить вправо"
                                    >
                                        ›
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}