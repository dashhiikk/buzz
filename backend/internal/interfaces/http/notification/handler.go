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
		Hub:       nil,
		Conn:      conn,
		Send:      make(chan []byte, 256),
		UserId:    userId,
		OnMessage: func(c *ws.Client, msg []byte) {},
	}

	h.hub.Register <- client

	go client.WritePump()
	go client.ReadPump()
}
