import { useEffect, useMemo, useState } from "react";

import expand from "../../assets/expand.svg";
import minimize from "../../assets/minimize.svg";
import placeholderVideo from "../../assets/screen.jpg";
import chat from "../../assets/chat.svg";

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
    onClose,
    videos: initialVideos = [],
}) {
    const [videos, setVideos] = useState(initialVideos);
    const [expandedVideoId, setExpandedVideoId] = useState(null);

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

    const handleRemoveVideo = (id) => {
        setVideos((prev) => prev.filter((video) => video.id !== id));
    };

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
                                onRemove={handleRemoveVideo}
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
                                onRemove={handleRemoveVideo}
                            />
                        </div>

                        {smallVideos.length > 0 && (
                            <div className="video-chat-strip">
                                {smallVideos.map((item) => (
                                    <VideoTile
                                        key={item.id}
                                        item={item}
                                        isCompact
                                        onToggleExpand={handleToggleExpand}
                                        onRemove={handleRemoveVideo}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}