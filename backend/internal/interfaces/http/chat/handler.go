package chat

import (
	"Buzz/internal/app/chat"
	"Buzz/internal/app/room"
	ws "Buzz/internal/infra/websocket"
	"Buzz/internal/middleware"
	"Buzz/pkg/jwt"
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
	jwtService  jwt.Service
}

func NewHandler(chatUseCase *chat.ChatUseCase, roomUseCase *room.RoomUseCase, hub *ws.Hub, jwtService jwt.Service) *Handler {
	return &Handler{
		chatUseCase: chatUseCase,
		roomUseCase: roomUseCase,
		hub:         hub,
		jwtService:  jwtService,
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

// ServeWebSocket godoc
// @Summary      Подключение к WebSocket для текстового чата
// @Description  Устанавливает WebSocket-соединение для обмена сообщениями в реальном времени. Соединение должно содержать query-параметр roomId и заголовок Authorization с Bearer-токеном.
// @Tags         chat
// @Security     BearerAuth
// @Param        roomId query string true "ID комнаты"
// @Success      101 "WebSocket-соединение установлено"
// @Failure      400 "Неверный id комнаты"
// @Failure      401 "Неавторизован"
// @Failure      403 "Не является участником комнаты"
// @Router       /ws/chat [get]
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

// handleMessage оправляет сообщение в текстовый чат комнаты, сохраняет его в БД и рассылает всем участникам комнаты.
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

// GetHistory godoc
// @Summary      Получить историю сообщений в комнате
// @Description  Возвращает сообщения из указанной комнаты с поддержкой пагинации (limit, offset). Сообщения сортируются по убыванию даты (новые сверху). По умолчанию limit=50, offset=0.
// @Tags         chat
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Id комнаты"
// @Param        limit query int false "Количество сообщений (max 100)" default(50)
// @Param        offset query int false "Смещение" default(0)
// @Success      200 {array} entity.Message "Список сообщений"
// @Failure      401 "Неавторизован"
// @Failure      403 "Пользователь не является участником комнаты"
// @Failure      500 "Внутренняя ошибка сервера"
// @Router       /rooms/{id}/text-chat [get]
func (h *Handler) GetHistory(w http.ResponseWriter, r *http.Request) {
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

func (h *Handler) DeleteMessage(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	messageId := chi.URLParam(r, "messageId")
	if messageId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing message id"))
		return
	}

	if err := h.chatUseCase.DeleteMessage(r.Context(), messageId, userId); err != nil {
		switch {
		case errors.Is(err, chat.ErrMessageNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, chat.ErrUserNotSender):
			h.writeError(w, http.StatusForbidden, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to delete message"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) PinMessage(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	roomId := chi.URLParam(r, "roomId")
	if roomId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing room id"))
		return
	}

	messageId := chi.URLParam(r, "messageId")
	if messageId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing message id"))
		return
	}

	if err := h.chatUseCase.PinMessage(r.Context(), messageId, roomId); err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to pin messade"))
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetPinnedMessage(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	roomId := chi.URLParam(r, "roomId")
	if roomId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing room id"))
		return
	}

	msg, err := h.chatUseCase.GetPinnedMessage(r.Context(), roomId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to get pinned message"))
		return
	}

	h.writeJSON(w, http.StatusOK, msg)
}
