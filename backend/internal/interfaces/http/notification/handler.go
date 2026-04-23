package notification

import (
	ws "Buzz/internal/infra/websocket"
	"Buzz/pkg/jwt"
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

type Handler struct {
	hub        *ws.NotificationHub
	jwtService jwt.Service
}

func NewHandler(hub *ws.NotificationHub, jwtService jwt.Service) *Handler {
	return &Handler{hub: hub, jwtService: jwtService}
}

func (h *Handler) writeError(w http.ResponseWriter, status int, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
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
	token := r.URL.Query().Get("token")
	if token == "" {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	claims, err := h.jwtService.Validate(token)
	if err != nil {
		h.writeError(w, http.StatusUnauthorized, errors.New("invalid token"))
		return
	}
	userId := claims.UserId

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
