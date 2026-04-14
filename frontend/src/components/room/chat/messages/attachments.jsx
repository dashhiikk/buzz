import fileIcon from "../../../../assets/file.svg";
import '../../../../css/chat/files.css'

function isImageFile(file) {
    const name = file?.originalName?.toLowerCase() || "";
    const url = file?.url?.toLowerCase() || "";

    return [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"]
        .some((ext) => name.endsWith(ext) || url.endsWith(ext));
}

function isVideoFile(file) {
    const name = file?.originalName?.toLowerCase() || "";
    const url = file?.url?.toLowerCase() || "";

    return [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"]
        .some((ext) => name.endsWith(ext) || url.endsWith(ext));
}

export default function MessageAttachments({ files, onOpenImage, onOpenVideo }) {
    const safeFiles = Array.isArray(files) ? files : [];

    const imageFiles = safeFiles.filter(isImageFile);
    const videoFiles = safeFiles.filter(isVideoFile);
    const otherFiles = safeFiles.filter(
        (file) => !isImageFile(file) && !isVideoFile(file)
    );

    return (
        <>
            {imageFiles.length > 0 && (
                <div className="message-images-list">
                    {imageFiles.map((file, index) => (
                        <div
                            key={file.url || index}
                            className="message-image-item"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenImage(file);
                            }}
                            onContextMenu={(e) => e.stopPropagation()}
                            title={file.originalName}
                        >
                            <img
                                src={file.url}
                                alt={file.originalName || "image"}
                                className="message-image-preview"
                            />
                        </div>
                    ))}
                </div>
            )}

            {videoFiles.length > 0 && (
                <div className="message-videos-list">
                    {videoFiles.map((file, index) => (
                        <div
                            key={file.url || index}
                            className="message-video-item"
                            title={file.originalName}
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenVideo(file);
                            }}
                            onContextMenu={(e) => e.stopPropagation()}
                        >
                            <video
                                className="message-video-preview"
                                src={file.url}
                                muted
                                preload="metadata"
                            />
                            <div className="message-video-badge">▶</div>
                        </div>
                    ))}
                </div>
            )}

            {otherFiles.length > 0 && (
                <div className="message-files-list">
                    {otherFiles.map((file, index) => (
                        <div
                            key={file.url || index}
                            className="message-file-item"
                            onClick={(e) => e.stopPropagation()}
                            onContextMenu={(e) => e.stopPropagation()}
                            title={file.originalName}
                        >
                            <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="message-file-link input-text text--dark"
                            >
                                <img className="message-file-icon" src={fileIcon} alt="" />
                                <span className="message-file-name">
                                    {file.originalName || "Файл"}
                                </span>
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}