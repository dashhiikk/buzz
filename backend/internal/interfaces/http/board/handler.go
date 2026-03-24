package board

import (
	"Buzz/internal/app/board"
	"Buzz/internal/app/room"
	ws "Buzz/internal/infra/websocket"
	"Buzz/internal/middleware"
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	boardUseCase *board.BoardUseCase
	roomUseCase  *room.RoomUseCase
	hub          *ws.Hub
}

func NewHandler(boardUC *board.BoardUseCase, roomUC *room.RoomUseCase, hub *ws.Hub) *Handler {
	return &Handler{
		boardUseCase: boardUC,
		roomUseCase:  roomUC,
		hub:          hub,
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
		h.writeError(w, http.StatusForbidden, errors.New("failed to verify room membership"))
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

	state, err := h.boardUseCase.GetState(r.Context(), roomId)
	if err != nil {
		log.Printf("failed to get board state: %v", err)
		state = []byte("()")
	}

	initMsg := map[string]interface{}{
		"type": "boardInit",
		"data": json.RawMessage(state),
	}

	initBytes, _ := json.Marshal(initMsg)
	client.Send <- initBytes

	go client.ReadPump()
	go client.WritePump()
}

func (h *Handler) handleMessage(ctx context.Context, client *ws.Client, msg []byte) {
	type BoardUpdate struct {
		Type    string          `json:"type"`
		Payload json.RawMessage `json:"payload"`
	}

	var update BoardUpdate
	if err := json.Unmarshal(msg, &update); err != nil {
		log.Printf("invalid board message: %v", err)
		return
	}

	if update.Type != "boardUpdate" {
		return
	}

	if err := h.boardUseCase.SaveState(ctx, client.RoomId, update.Payload); err != nil {
		log.Printf("failed to save board state: %v", err)
		return
	}

	resp := map[string]interface{}{
		"type":    "boardUpdate",
		"payload": update.Payload,
	}
	respBytes, _ := json.Marshal(resp)

	h.hub.Broadcast <- &ws.BroadcastMessage{
		RoomId:  client.RoomId,
		Message: respBytes,
	}
}

func (h *Handler) GetState(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
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
		h.writeError(w, http.StatusForbidden, errors.New("not a member of this room"))
		return
	}

	state, err := h.boardUseCase.GetState(r.Context(), roomId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to get board state"))
		return
	}

	h.writeJSON(w, http.StatusOK, json.RawMessage(state))
}
