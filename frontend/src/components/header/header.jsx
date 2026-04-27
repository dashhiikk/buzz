import buzziconbee from "../../assets/buzz-icon-bee.svg"
import settings from "../../assets/settings-icon.svg"
import userIcon from "../../assets/user-icon.svg"
import notificationIcon from "../../assets/notification.svg"

import "../../css/header.css"

import Settings from "../settings/settings"
import UserPopup from "./user-popup"
import Requests from "../../modals/requests/requests"
import NotificationToast from "../notification"

import { useState, useEffect, useRef, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "../../hooks/use-auth"
import { useNotificationWebSocket } from "../../hooks/useNotificationWebSocket"
import usePersistedState from "../../hooks/use-persisted-state"

const INCOMING_REQUEST_TYPES = new Set([
  "friend_request",
  "room_request",
  "room_invite",
  "room_invitation",
  "room_join_request",
])

function buildNotificationMessage(payload) {
  const data = payload?.data
  const from = data?.from
  const senderName =
    from?.username || data?.senderName || payload?.senderName || null
  const senderCode = from?.code || data?.senderCode || payload?.senderCode || null
  const roomName =
    data?.room?.name || data?.roomName || payload?.roomName || null
  const roomLabel = roomName || "без названия"
  const fromLabel = senderName
    ? `${senderName}${senderCode ? `#${senderCode}` : ""}`
    : "Пользователь"

  switch (payload?.type) {
    case "friend_request":
      return `${fromLabel} отправил(а) вам запрос на дружбу`

    case "friend_request_accepted":
      return `${fromLabel} принял(а) ваш запрос на дружбу`

    case "friend_request_rejected":
      return `${fromLabel} отклонил(а) ваш запрос на дружбу`

    case "room_request":
    case "room_invite":
    case "room_invitation":
    case "room_join_request":
      return `${fromLabel} отправил(а) вам приглашение на вступление в комнату ${roomLabel}`

    case "room_request_accepted":
    case "room_invite_accepted":
    case "room_invitation_accepted":
    case "room_join_request_accepted":
      return `${fromLabel} принял(а) ваше приглашение на вступление в комнату ${roomLabel}`

    case "room_request_rejected":
    case "room_invite_rejected":
    case "room_invitation_rejected":
    case "room_join_request_rejected":
      return `${fromLabel} отклонил(а) ваше приглашение на вступление в комнату ${roomLabel}`

    case "room_deleted":
      return `Комната ${roomLabel} была удалена`

    default:
      return null
  }
}

export default function Header({
  hideIconsAndLogo,
  currentRoomId,
  onRequestAccepted,
}) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [openSettings, setOpenSettings] = useState(false)
  const [rotatedSettings, setRotatedSettings] = useState(false)
  const handleClick = () => {
    setOpenSettings((prev) => !prev)
    setRotatedSettings((prev) => !prev)
  }

  const [openUser, setOpenUser] = useState(false)
  const [rotatedUser, setRotatedUser] = useState(false)
  const handleUserClick = () => {
    setOpenUser((prev) => !prev)
    setRotatedUser((prev) => !prev)
  }

  const [isRequestsOpen, setIsRequestOpen] = useState(false)
  const openRequestsModal = () => {
    setOpenUser(false)
    setHasUnreadRequests(false)
    setIsRequestOpen(true)
  }

  const [animateRing, setAnimateRing] = useState(true)
  const [hasUnreadRequests, setHasUnreadRequests] = usePersistedState(
    "notifications:hasUnreadRequests",
    false
  )
  const [requestsRefreshKey, setRequestsRefreshKey] = useState(0)
  const [toast, setToast] = useState(null)
  const showToast = useCallback((message) => {
    if (!message) return

    setToast({
      id: `${Date.now()}-${Math.random()}`,
      message,
    })
  }, [])

  const handleNotification = useCallback(
    (payload) => {
      const deletedRoomId = payload?.data?.roomId || payload?.data?.room?.id
      const activeRoomId = currentRoomId ?? location.state?.roomId

      if (
        payload?.type === "room_deleted" &&
        location.pathname === "/room" &&
        activeRoomId &&
        activeRoomId === deletedRoomId
      ) {
        navigate("/start", { replace: true })
        return
      }

      setRequestsRefreshKey((prev) => prev + 1)

      const message = buildNotificationMessage(payload)
      if (message) {
        showToast(message)
      }

      if (INCOMING_REQUEST_TYPES.has(payload?.type) && !isRequestsOpen) {
        setHasUnreadRequests(true)
      }
    },
    [
      currentRoomId,
      isRequestsOpen,
      location.pathname,
      location.state,
      navigate,
      setHasUnreadRequests,
      showToast,
    ]
  )

  useNotificationWebSocket(user?.id, {
    onNotification: handleNotification,
  })

  useEffect(() => {
    if (!hasUnreadRequests) return

    let timeoutId
    let ringResetId

    const scheduleRing = () => {
      timeoutId = setTimeout(() => {
        setAnimateRing(true)
        ringResetId = setTimeout(() => setAnimateRing(false), 500)
        scheduleRing()
      }, 2000)
    }

    scheduleRing()

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(ringResetId)
    }
  }, [hasUnreadRequests])

  const settingsRef = useRef()
  useEffect(() => {
    const handleClickOutsideSettings = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setOpenSettings(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSettings)
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideSettings)
  }, [])

  const userRef = useRef()
  useEffect(() => {
    const handleClickOutsideUser = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setOpenUser(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutsideUser)
    return () => document.removeEventListener("mousedown", handleClickOutsideUser)
  }, [])

  return (
    <main className={`header ${hideIconsAndLogo ? "hidden" : ""}`}>
      <div className="header-content">
        <img className="header-buzz-img" src={buzziconbee}></img>
        <h1 className="buzz">buzz</h1>
        <div className="header-icons">
          <div className="header-wrapper" ref={settingsRef}>
            <img
              src={settings}
              alt="settings"
              className={`header-wrapper-img ${rotatedSettings ? "rotated" : ""}`}
              onClick={handleClick}
            />
            {openSettings && <Settings />}
          </div>
          <div className="header-wrapper" ref={userRef}>
            <img
              src={user?.avatar || userIcon}
              alt="user"
              className={`header-wrapper-img ${rotatedUser ? "rotated" : ""}`}
              onClick={handleUserClick}
            />
            {hasUnreadRequests && (
              <div className={`notification-bell ${animateRing ? "ring" : ""}`}>
                <img src={notificationIcon} alt="Новые уведомления" />
              </div>
            )}
            {toast && (
              <NotificationToast
                key={toast.id}
                message={toast.message}
                duration={5000}
                onClose={() => setToast(null)}
              />
            )}
            {openUser && <UserPopup onOpenRequests={openRequestsModal} />}
          </div>
          <Requests
            isOpen={isRequestsOpen}
            onClose={() => setIsRequestOpen(false)}
            refreshKey={requestsRefreshKey}
            onRequestAccepted={onRequestAccepted}
          />
        </div>
      </div>
    </main>
  )
}
