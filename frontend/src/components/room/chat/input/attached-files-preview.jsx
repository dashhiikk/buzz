import '../../../../css/chat/attached-files-preview.css'

export default function AttachedFilesPreview({
    files = [],
    onRemoveFile,
}) {
    if (files.length === 0) return null;

    return (
        <div className="attached-files-preview">
            {files.map((file, index) => (
                <div key={file.url || index} className="attached-file-chip">
                    <span title={file.originalName}>
                        {file.originalName || "Файл"}
                    </span>
                    <button
                        type="button"
                        className="attached-file-remove"
                        onClick={() => onRemoveFile(index)}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}