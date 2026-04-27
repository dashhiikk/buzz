import JitsiStage from "./jitsi-stage"

import "../../css/page/transition-btn.css"
import "../../css/room/video-chat.css"

export default function VideoChat({
    attachStage,
    isJoined,
}) {
    return (
        <>
            <div className="right-block-header">
                <p className="medium-text text--light">Видео-чат</p>
            </div>

            <div className="video-chat">
                {isJoined ? (
                    <JitsiStage
                        attachStage={attachStage}
                        mode="video"
                        className="video-chat-stage"
                    />
                ) : (
                    <div className="video-chat-empty">
                        Сначала подключитесь к голосовому чату
                    </div>
                )}
            </div>
        </>
    )
}
