package chat

import (
	"Buzz/internal/app/chat"
	"Buzz/internal/app/room"
	ws "Buzz/internal/infra/websocket"
	"Buzz/internal/middleware"
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	chatUseCase *chat.ChatUseCase
	roomUseCase *room.RoomUseCase
	hub         *ws.Hub
}

func NewHandler(chatUseCase *chat.ChatUseCase, roomUseCase *room.RoomUseCase, hub *ws.Hub) *Handler {
	return &Handler{
		chatUseCase: chatUseCase,
		roomUseCase: roomUseCase,
		hub:         hub,
	}
}

func (h *Handler) writeError(w http.ResponseWriter, status int, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (h *Handler) ServeWebSocket(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	roomId := r.URL.Query().Get("roomId")
	if roomId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing room id"))
		return
	}

	participants, err := h.roomUseCase.GetParticipants(r.Context(), roomId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to get room participants"))
		return
	}
	isParticipant := false
	for _, p := range participants {
		if p.Id == userId {
			isParticipant = true
			break
		}
	}
	if !isParticipant {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to verify room membership"))
		return
	}

	conn, err := ws.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("failed to upgrade: %v", err)
		return
	}

	client := &ws.Client{
		Hub:    h.hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		UserId: userId,
		RoomId: roomId,
		OnMessage: func(c *ws.Client, msg []byte) {
			h.handleMessage(context.Background(), c, msg)
		},
	}

	h.hub.Register <- client

	go client.WritePump()
	go client.ReadPump()
}

func (h *Handler) handleMessage(ctx context.Context, client *ws.Client, msg []byte) {
	type MessageRequest struct {
		Type    string `json:"type"`
		Payload struct {
			Text  string   `json:"text"`
			Files []string `json:"files,omitempty"`
		} `json:"payload"`
	}

	var req MessageRequest
	if err := json.Unmarshal(msg, &req); err != nil {
		log.Printf("invalid message format: %v", err)
		return
	}
	if req.Type != "message" {
		return
	}

	savedMsg, err := h.chatUseCase.SendMessage(
		ctx,
		client.RoomId,
		client.UserId,
		req.Payload.Text,
		req.Payload.Files,
	)
	if err != nil {
		log.Printf("faliled to save message: %v", err)
		return
	}

	resp := map[string]interface{}{
		"type": "message",
		"data": savedMsg,
	}
	respBytes, _ := json.Marshal(resp)

	h.hub.Broadcast <- &ws.BroadcastMessage{
		RoomId:  client.RoomId,
		Message: respBytes,
	}
}

func (h *Handler) GeyHistory(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	roomId := chi.URLParam(r, "id")
	if roomId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing room id"))
		return
	}

	participants, err := h.roomUseCase.GetParticipants(r.Context(), roomId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to verify membership"))
		return
	}
	isParticipant := false
	for _, p := range participants {
		if p.Id == userID {
			isParticipant = true
			break
		}
	}
	if !isParticipant {
		h.writeError(w, http.StatusForbidden, errors.New("not a member of this room"))
		return
	}

	limit := 50
	offset := 0
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed >= 100 {
			limit = parsed
		}
	}
	if o := r.URL.Query().Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	messages, err := h.chatUseCase.GetHistory(r.Context(), roomId, limit, offset)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to get history"))
		return
	}

	h.writeJSON(w, http.StatusOK, messages)
}
