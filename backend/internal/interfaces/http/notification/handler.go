package notification

import (
	ws "Buzz/internal/infra/websocket"
	"Buzz/internal/middleware"
	"log"
	"net/http"
)

type Handler struct {
	hub *ws.NotificationHub
}

func NewHandler(hub *ws.NotificationHub) *Handler {
	return &Handler{hub: hub}
}

// ServeWebSocket godoc
// @Summary      Подключение к WebSocket для уведомлений
// @Description  Устанавливает WebSocket-соединение для отправвки уведомлений в реальном времени. Соединение должно содержать заголовок Authorization с Bearer-токеном.
// @Tags         notifications
// @Security     BearerAuth
// @Success      101 "WebSocket-соединение установлено"
// @Failure      401 "Неавторизован"
// @Router       /ws/notifications [get]
func (h *Handler) ServeWebSocket(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	conn, err := ws.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("failed to upgrade: %v", err)
		return
	}

	client := &ws.Client{
		NotificationHub: h.hub,
		Conn:            conn,
		Send:            make(chan []byte, 256),
		UserId:          userId,
		OnMessage:       func(c *ws.Client, msg []byte) {},
	}

	h.hub.Register <- client

	go client.WritePump()
	go client.ReadPump()
}
