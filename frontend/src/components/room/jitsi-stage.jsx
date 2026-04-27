import { useEffect, useRef } from "react"

export default function JitsiStage({
    attachStage,
    mode = "hidden",
    participantId = null,
    className = "",
}) {
    const containerRef = useRef(null)

    useEffect(() => {
        attachStage?.(containerRef.current, {
            mode,
            participantId,
        })

        return () => {
            attachStage?.(null, { mode: "hidden" })
        }
    }, [attachStage, mode, participantId])

    return <div ref={containerRef} className={className} />
}
