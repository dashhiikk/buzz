import { createPortal } from "react-dom";

export default function MediaPreviewPortal({
    openedImage,
    openedVideo,
    onCloseImage,
    onCloseVideo,
}) {
    return (
        <>
            {openedImage &&
                createPortal(
                    <div className="image-preview-overlay" onClick={onCloseImage}>
                        <div
                            className="image-preview-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={openedImage.url}
                                alt={openedImage.originalName || "image"}
                                className="image-preview-full"
                            />
                            <p className="input-text text--light image-preview-name">
                                {openedImage.originalName || "Изображение"}
                            </p>
                        </div>
                    </div>,
                    document.body
                )}

            {openedVideo &&
                createPortal(
                    <div className="video-preview-overlay" onClick={onCloseVideo}>
                        <div
                            className="video-preview-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <video
                                src={openedVideo.url}
                                className="video-preview-full"
                                controls
                                autoPlay
                            />
                            <p className="input-text text--light video-preview-name">
                                {openedVideo.originalName || "Видео"}
                            </p>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}