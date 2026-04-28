import { useCallback, useEffect, useRef, useState } from "react"

let jitsiScriptPromise = null
let jitsiScriptUrl = null

function normalizeServerUrl(serverUrl) {
    if (!serverUrl) {
        return ""
    }

    try {
        const parsed = new URL(serverUrl)
        parsed.pathname = ""
        parsed.search = ""
        parsed.hash = ""
        return parsed.toString().replace(/\/$/, "")
    } catch {
        return `https://${serverUrl}`.replace(/\/$/, "")
    }
}

function getJitsiDomain(serverUrl) {
    const normalized = normalizeServerUrl(serverUrl)
    if (!normalized) {
        return ""
    }

    return new URL(normalized).hostname
}

function shouldUseJwt(serverUrl) {
    const domain = getJitsiDomain(serverUrl)
    return Boolean(domain) && domain !== "meet.jit.si"
}

function getJitsiErrorName(event) {
    return event?.error?.name || event?.details?.name || event?.name || ""
}

function buildJitsiErrorMessage(event, serverUrl) {
    const errorName = getJitsiErrorName(event)
    const domain = getJitsiDomain(serverUrl)

    if (errorName === "conference.connectionError.membersOnly") {
        if (domain === "meet.jit.si") {
            return "meet.jit.si больше не поддерживает анонимное создание комнат из встраиваемых приложений. Нужен свой Jitsi-сервер или JaaS."
        }

        return "Вход в конференцию ограничен настройками lobby или moderator на Jitsi-сервере."
    }

    return (
        event?.details?.message ||
        event?.error?.message ||
        errorName ||
        "Jitsi error"
    )
}

function loadJitsiApi(serverUrl) {
    const normalized = normalizeServerUrl(serverUrl)
    if (!normalized) {
        return Promise.reject(new Error("Jitsi server URL is missing"))
    }

    const nextScriptUrl = `${normalized}/external_api.js`

    if (
        typeof window !== "undefined" &&
        window.JitsiMeetExternalAPI &&
        jitsiScriptUrl === nextScriptUrl
    ) {
        return Promise.resolve()
    }

    if (jitsiScriptPromise && jitsiScriptUrl === nextScriptUrl) {
        return jitsiScriptPromise
    }

    jitsiScriptUrl = nextScriptUrl
    jitsiScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector(
            `script[data-jitsi-api="${nextScriptUrl}"]`
        )

        if (existingScript && window.JitsiMeetExternalAPI) {
            resolve()
            return
        }

        const script = existingScript || document.createElement("script")
        script.src = nextScriptUrl
        script.async = true
        script.dataset.jitsiApi = nextScriptUrl

        script.onload = () => resolve()
        script.onerror = () => {
            jitsiScriptPromise = null
            reject(new Error("Failed to load Jitsi API"))
        }

        if (!existingScript) {
            document.body.appendChild(script)
        }
    })

    return jitsiScriptPromise
}

function buildDisplayName(user) {
    if (!user?.username) {
        return "Пользователь"
    }

    return user.code ? `${user.username}#${user.code}` : user.username
}

function createHiddenHost() {
    const host = document.createElement("div")
    host.setAttribute("aria-hidden", "true")
    Object.assign(host.style, {
        position: "fixed",
        top: "0",
        left: "-9999px",
        width: "1px",
        height: "1px",
        opacity: "0",
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: "-1",
    })

    document.body.appendChild(host)
    return host
}

function normalizeParticipantInfo(participant) {
    if (!participant?.participantId && !participant?.id) {
        return null
    }

    return {
        participantId: participant.participantId || participant.id,
        id: participant.id || participant.participantId,
        displayName:
            participant.displayName ||
            participant.formattedDisplayName ||
            participant.name ||
            "",
        avatarURL: participant.avatarURL || participant.avatarUrl || null,
        userContext: participant.userContext || null,
    }
}

export default function useJitsiMeeting({
    roomId,
    credentials,
    user,
    roomParticipants = [],
}) {
    const apiRef = useRef(null)
    const hiddenHostRef = useRef(null)
    const requestedSurfaceRef = useRef({
        container: null,
        mode: "hidden",
        participantId: null,
    })
    const localParticipantIdRef = useRef(null)
    const sharingParticipantIdsRef = useRef(new Set())
    const roomParticipantsRef = useRef(roomParticipants)
    const userRef = useRef(user)
    const participantsRef = useRef([])
    const conferenceRosterRef = useRef(new Map())
    const pendingDisposeRef = useRef(false)

    const [participants, setParticipants] = useState([])
    const [isConnecting, setIsConnecting] = useState(false)
    const [isJoined, setIsJoined] = useState(false)
    const [micOn, setMicOn] = useState(true)
    const [headphonesOn, setHeadphonesOn] = useState(true)
    const [demoOn, setDemoOn] = useState(false)
    const [cameraOn, setCameraOn] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        roomParticipantsRef.current = roomParticipants
    }, [roomParticipants])

    useEffect(() => {
        userRef.current = user
    }, [user])

    const setConferenceParticipants = useCallback((updater) => {
        setParticipants((prev) => {
            const next =
                typeof updater === "function" ? updater(prev) : updater
            participantsRef.current = next
            return next
        })
    }, [])

    const ensureHiddenHost = useCallback(() => {
        if (hiddenHostRef.current && document.body.contains(hiddenHostRef.current)) {
            return hiddenHostRef.current
        }

        hiddenHostRef.current = createHiddenHost()
        return hiddenHostRef.current
    }, [])

    const getParticipantLookup = useCallback(() => {
        const byId = new Map()
        const byName = new Map()

        roomParticipantsRef.current.forEach((participant) => {
            const label = participant.code
                ? `${participant.username}#${participant.code}`
                : participant.username

            const participantData = {
                id: participant.id,
                name: label,
                icon: participant.avatar || null,
                avatar: participant.avatar || null,
            }

            byId.set(participant.id, participantData)
            byName.set(label, participantData)
        })

        return { byId, byName }
    }, [])

    const applySurface = useCallback(() => {
        const api = apiRef.current
        if (!api) {
            return
        }

        const surface = requestedSurfaceRef.current
        const fallbackHost = ensureHiddenHost()
        const target = surface.container || fallbackHost
        const iframe = api.getIFrame()

        if (iframe && target && iframe.parentNode !== target) {
            target.appendChild(iframe)
        }

        if (iframe) {
            iframe.style.width = "100%"
            iframe.style.height = "100%"
            iframe.style.border = "0"
            iframe.style.display = "block"
        }

        if (surface.mode === "video") {
            api.executeCommand?.("setTileView", false)
            if (localParticipantIdRef.current) {
                api.pinParticipant?.(localParticipantIdRef.current)
                api.setLargeVideoParticipant?.(localParticipantIdRef.current)
            }
            return
        }

        if (surface.mode === "screen" && surface.participantId) {
            api.executeCommand?.("setTileView", false)
            api.pinParticipant?.(surface.participantId, "desktop")
            api.setLargeVideoParticipant?.(surface.participantId)
        }
    }, [ensureHiddenHost])

    const updateParticipant = useCallback((participantId, patch) => {
        setConferenceParticipants((prev) =>
            prev.map((participant) =>
                participant.participantId === participantId
                    ? {
                          ...participant,
                          ...patch,
                      }
                    : participant
            )
        )
    }, [setConferenceParticipants])

    const syncConferenceParticipants = useCallback(async () => {
        const api = apiRef.current
        if (!api || !localParticipantIdRef.current) {
            return
        }

        try {
            let conferenceParticipants = []

            if (typeof api.getParticipantsInfo === "function") {
                conferenceParticipants = await api.getParticipantsInfo()
            }

            if (!Array.isArray(conferenceParticipants) || !conferenceParticipants.length) {
                conferenceParticipants = Array.from(
                    conferenceRosterRef.current.values()
                )
            }

            const normalizedParticipants = conferenceParticipants
                .map(normalizeParticipantInfo)
                .filter(Boolean)
            const lookup = getParticipantLookup()
            const sharingParticipants = sharingParticipantIdsRef.current
            const previousById = new Map(
                participantsRef.current.map((participant) => [
                    participant.participantId,
                    participant,
                ])
            )

            const nextParticipants = normalizedParticipants
                .map((participant) => {
                    const participantId = participant.participantId
                    const isLocal =
                        participantId === localParticipantIdRef.current
                    const appUserId =
                        participant.userContext?.id ||
                        (isLocal ? userRef.current?.id : null)
                    const fallbackParticipant = appUserId
                        ? lookup.byId.get(appUserId)
                        : lookup.byName.get(participant.displayName)
                    const previousParticipant = previousById.get(participantId)

                    return {
                        id: participantId,
                        participantId,
                        appUserId,
                        name:
                            participant.displayName ||
                            fallbackParticipant?.name ||
                            "Пользователь",
                        icon:
                            participant.avatarURL ||
                            participant.avatarUrl ||
                            fallbackParticipant?.icon ||
                            null,
                        avatar:
                            participant.avatarURL ||
                            participant.avatarUrl ||
                            fallbackParticipant?.avatar ||
                            null,
                        isLocal,
                        isAudioMuted:
                            previousParticipant?.isAudioMuted ?? false,
                        isVideoMuted:
                            previousParticipant?.isVideoMuted ?? false,
                        isScreenSharing: sharingParticipants.has(participantId),
                    }
                })
                .sort((left, right) => {
                    if (left.isLocal && !right.isLocal) {
                        return -1
                    }
                    if (!left.isLocal && right.isLocal) {
                        return 1
                    }
                    return left.name.localeCompare(right.name)
                })

            setConferenceParticipants(nextParticipants)
        } catch (syncError) {
            console.error("Failed to sync Jitsi participants:", syncError)
        }
    }, [getParticipantLookup, setConferenceParticipants])

    const resetConferenceState = useCallback(() => {
        localParticipantIdRef.current = null
        sharingParticipantIdsRef.current = new Set()
        conferenceRosterRef.current = new Map()
        requestedSurfaceRef.current = {
            ...requestedSurfaceRef.current,
            participantId: null,
        }
        setConferenceParticipants([])
        setIsConnecting(false)
        setIsJoined(false)
        setMicOn(true)
        setHeadphonesOn(true)
        setDemoOn(false)
        setCameraOn(false)
    }, [setConferenceParticipants])

    const disposeConference = useCallback((force = false) => {
        const api = apiRef.current
        if (!api) {
            console.log("Jitsi disposeConference skipped: no api", { force })
            resetConferenceState()
            return
        }

        console.log("Jitsi disposeConference", {
            force,
            pendingDispose: pendingDisposeRef.current,
            localParticipantId: localParticipantIdRef.current,
        })
        pendingDisposeRef.current = false

        try {
            api.dispose()
        } catch (disposeError) {
            if (!force) {
                console.error("Failed to dispose Jitsi conference:", disposeError)
            }
        } finally {
            apiRef.current = null
            resetConferenceState()
        }
    }, [resetConferenceState])

    const leaveConference = useCallback(() => {
        const api = apiRef.current
        if (!api) {
            resetConferenceState()
            return
        }

        pendingDisposeRef.current = true
        setIsConnecting(false)

        try {
            api.executeCommand?.("hangup")
        } catch (hangupError) {
            console.error("Failed to hang up Jitsi conference:", hangupError)
            disposeConference(true)
            return
        }

        window.setTimeout(() => {
            if (pendingDisposeRef.current) {
                disposeConference(true)
            }
        }, 1500)
    }, [disposeConference, resetConferenceState])

    const attachStage = useCallback(
        (container, { mode = "hidden", participantId = null } = {}) => {
            console.log("Jitsi attachStage", {
                mode,
                participantId,
                hasContainer: Boolean(container),
            })
            requestedSurfaceRef.current = {
                container,
                mode,
                participantId,
            }

            applySurface()
        },
        [applySurface]
    )

    const joinConference = useCallback(async () => {
        if (!roomId || !credentials?.token || !credentials?.serverUrl || !user) {
            return
        }

        if (apiRef.current || isConnecting || isJoined) {
            return
        }

        setError(null)
        setIsConnecting(true)

        try {
            await loadJitsiApi(credentials.serverUrl)

            const parentNode = ensureHiddenHost()
            const domain = getJitsiDomain(credentials.serverUrl)

            console.log("Jitsi create api instance", {
                roomId,
                domain,
                hasJwt: Boolean(credentials.token),
            })

            const api = new window.JitsiMeetExternalAPI(domain, {
                roomName: roomId,
                parentNode,
                width: "100%",
                height: "100%",
                jwt: shouldUseJwt(credentials.serverUrl)
                    ? credentials.token
                    : undefined,
                userInfo: {
                    displayName: buildDisplayName(user),
                },
                configOverwrite: {
                    prejoinConfig: {
                        enabled: false,
                    },
                    disableDeepLinking: true,
                    disableInviteFunctions: true,
                    startWithAudioMuted: false,
                    startWithVideoMuted: true,
                    toolbarButtons: [],
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [],
                    MOBILE_APP_PROMO: false,
                },
            })

            apiRef.current = api

            api.addListener("videoConferenceJoined", async (event) => {
                console.log("Jitsi videoConferenceJoined", event)
                localParticipantIdRef.current = event?.id || null

                if (event?.id) {
                    conferenceRosterRef.current.set(event.id, {
                        participantId: event.id,
                        id: event.id,
                        displayName: buildDisplayName(user),
                        userContext: {
                            id: user.id,
                        },
                    })
                }

                setError(null)
                setIsJoined(true)
                setIsConnecting(false)
                setMicOn(true)
                setCameraOn(false)
                setDemoOn(false)

                await syncConferenceParticipants()
                applySurface()
            })

            api.addListener("participantJoined", (event) => {
                const normalizedParticipant = normalizeParticipantInfo(event)

                if (normalizedParticipant) {
                    conferenceRosterRef.current.set(
                        normalizedParticipant.participantId,
                        normalizedParticipant
                    )
                }

                syncConferenceParticipants()
            })

            api.addListener("participantLeft", (event) => {
                sharingParticipantIdsRef.current.delete(event?.id)

                if (event?.id) {
                    conferenceRosterRef.current.delete(event.id)
                }

                setConferenceParticipants((prev) =>
                    prev.filter(
                        (participant) => participant.participantId !== event?.id
                    )
                )
            })

            api.addListener("displayNameChange", (event) => {
                const normalizedParticipant = normalizeParticipantInfo(event)

                if (normalizedParticipant) {
                    const previousParticipant = conferenceRosterRef.current.get(
                        normalizedParticipant.participantId
                    )

                    conferenceRosterRef.current.set(
                        normalizedParticipant.participantId,
                        {
                            ...previousParticipant,
                            ...normalizedParticipant,
                        }
                    )
                }

                syncConferenceParticipants()
            })

            api.addListener("avatarChanged", (event) => {
                const normalizedParticipant = normalizeParticipantInfo(event)

                if (normalizedParticipant) {
                    const previousParticipant = conferenceRosterRef.current.get(
                        normalizedParticipant.participantId
                    )

                    conferenceRosterRef.current.set(
                        normalizedParticipant.participantId,
                        {
                            ...previousParticipant,
                            ...normalizedParticipant,
                        }
                    )
                }

                syncConferenceParticipants()
            })

            api.addListener("participantMuted", (event) => {
                if (!event?.participantId) {
                    return
                }

                if (event.mediaType === "audio") {
                    updateParticipant(event.participantId, {
                        isAudioMuted: Boolean(event.isMuted),
                    })
                }

                if (event.mediaType === "video") {
                    updateParticipant(event.participantId, {
                        isVideoMuted: Boolean(event.isMuted),
                    })
                }
            })

            api.addListener("audioMuteStatusChanged", (event) => {
                const nextMicOn = !event?.muted
                setMicOn(nextMicOn)

                if (localParticipantIdRef.current) {
                    updateParticipant(localParticipantIdRef.current, {
                        isAudioMuted: !nextMicOn,
                    })
                }
            })

            api.addListener("videoMuteStatusChanged", (event) => {
                console.log("Jitsi videoMuteStatusChanged:", event)
                const nextCameraOn = !event?.muted
                setCameraOn(nextCameraOn)

                if (localParticipantIdRef.current) {
                    updateParticipant(localParticipantIdRef.current, {
                        isVideoMuted: !nextCameraOn,
                    })
                }
            })

            api.addListener("screenSharingStatusChanged", (event) => {
                const isSharing = Boolean(event?.on)
                setDemoOn(isSharing)

                if (localParticipantIdRef.current) {
                    const nextSharingParticipants = new Set(
                        sharingParticipantIdsRef.current
                    )

                    if (isSharing) {
                        nextSharingParticipants.add(localParticipantIdRef.current)
                    } else {
                        nextSharingParticipants.delete(localParticipantIdRef.current)
                    }

                    sharingParticipantIdsRef.current = nextSharingParticipants
                    updateParticipant(localParticipantIdRef.current, {
                        isScreenSharing: isSharing,
                    })
                }
            })

            api.addListener("contentSharingParticipantsChanged", (event) => {
                const nextSharingParticipants = new Set(
                    Array.isArray(event?.data) ? event.data.filter(Boolean) : []
                )

                sharingParticipantIdsRef.current = nextSharingParticipants
                setConferenceParticipants((prev) =>
                    prev.map((participant) => ({
                        ...participant,
                        isScreenSharing: nextSharingParticipants.has(
                            participant.participantId
                        ),
                    }))
                )
            })

            api.addListener("readyToClose", () => {
                console.log("Jitsi readyToClose", {
                    pendingDispose: pendingDisposeRef.current,
                })
                if (pendingDisposeRef.current) {
                    disposeConference(true)
                }
            })

            api.addListener("videoConferenceLeft", () => {
                console.log("Jitsi videoConferenceLeft", {
                    pendingDispose: pendingDisposeRef.current,
                })
                if (pendingDisposeRef.current) {
                    disposeConference(true)
                    return
                }

                resetConferenceState()
            })

            api.addListener("errorOccurred", (event) => {
                console.error("Jitsi error:", event)
                const errorName = getJitsiErrorName(event)
                const isFatal = Boolean(event?.error?.isFatal || event?.isFatal)
                const errorMessage = buildJitsiErrorMessage(
                    event,
                    credentials?.serverUrl
                )

                setError(errorMessage)
                setIsConnecting(false)

                if (
                    !localParticipantIdRef.current &&
                    errorName === "conference.connectionError.membersOnly" &&
                    getJitsiDomain(credentials?.serverUrl) === "meet.jit.si"
                ) {
                    disposeConference(true)
                    return
                }

                if (!localParticipantIdRef.current && isFatal) {
                    disposeConference(true)
                }
            })

            api.addListener("cameraError", (event) => {
                console.error("Jitsi camera error:", event)
                setError("Не удалось получить доступ к камере")
            })

            api.addListener("micError", (event) => {
                console.error("Jitsi microphone error:", event)
                setError("Не удалось получить доступ к микрофону")
            })

            applySurface()
        } catch (joinError) {
            console.error("Failed to join Jitsi conference:", joinError)
            setError(joinError.message || "Failed to join Jitsi conference")
            setIsConnecting(false)
            disposeConference(true)
        }
    }, [
        applySurface,
        credentials,
        disposeConference,
        ensureHiddenHost,
        isConnecting,
        isJoined,
        resetConferenceState,
        roomId,
        setConferenceParticipants,
        syncConferenceParticipants,
        updateParticipant,
        user,
    ])

    const toggleMicrophone = useCallback(() => {
        apiRef.current?.executeCommand?.("toggleAudio")
    }, [])

    const toggleCamera = useCallback(() => {
        console.log("Jitsi toggleCamera invoked", {
            isJoined,
            localParticipantId: localParticipantIdRef.current,
            cameraOn,
            hasApi: Boolean(apiRef.current),
        })
        apiRef.current?.executeCommand?.("toggleVideo")
    }, [cameraOn, isJoined])

    const toggleScreenShare = useCallback(() => {
        apiRef.current?.executeCommand?.("toggleShareScreen")
    }, [])

    const toggleHeadphones = useCallback(() => {
        setHeadphonesOn((prev) => !prev)
    }, [])

    useEffect(() => {
        const api = apiRef.current
        if (!api || !participantsRef.current.length) {
            return
        }

        participantsRef.current.forEach((participant) => {
            if (participant.isLocal) {
                return
            }

            api.executeCommand?.(
                "setParticipantVolume",
                participant.participantId,
                headphonesOn ? 1 : 0
            )
        })
    }, [headphonesOn, participants])

    useEffect(() => {
        if (apiRef.current && isJoined) {
            syncConferenceParticipants()
        }
    }, [isJoined, roomParticipants, syncConferenceParticipants])

    useEffect(() => {
        return () => {
            disposeConference(true)

            if (
                hiddenHostRef.current &&
                document.body.contains(hiddenHostRef.current)
            ) {
                document.body.removeChild(hiddenHostRef.current)
            }
        }
    }, [disposeConference])

    return {
        participants,
        isConnecting,
        isJoined,
        micOn,
        headphonesOn,
        demoOn,
        cameraOn,
        error,
        joinConference,
        leaveConference,
        toggleMicrophone,
        toggleHeadphones,
        toggleScreenShare,
        toggleCamera,
        attachStage,
    }
}
