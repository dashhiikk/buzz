package jitsi

import (
	"Buzz/internal/app/room"
	"Buzz/internal/middleware"
	"Buzz/pkg/jitsi"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	jitsi       *jitsi.JitsiJWT
	roomUseCase *room.RoomUseCase
	serverURL   string
}

func NewHandler(jitsi *jitsi.JitsiJWT, roomUC *room.RoomUseCase, serverURL string) *Handler {
	return &Handler{
		jitsi:       jitsi,
		roomUseCase: roomUC,
		serverURL:   serverURL,
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

// GetToken godoc
// @Summary      Получить JWT-токен для подключения к Jitsi
// @Description  Генерирует и возвращает JWT-токен, который позволяет подключиться к видеоконференции в указанной комнате. Пользователь должен быть участником комнаты. Токен действует ограниченное время.
// @Tags         jitsi
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "ID комнаты"
// @Success      200 {object} GetTokenResponse "Токен и URL сервера"
// @Failure      400 {object} map[string]string "Отсутствует ID комнаты"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      403 {object} map[string]string "Пользователь не является участником комнаты"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера (например, не удалось сгенерировать токен)"
// @Router       /rooms/{id}/jitsi-token [get]
func (h *Handler) GetToken(w http.ResponseWriter, r *http.Request) {
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
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to verify membership"))
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

	token, err := h.jitsi.GenerateToken(roomId, userId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to generate token"))
		return
	}

	h.writeJSON(w, http.StatusOK, GetTokenResponse{
		Token:     token,
		ServerUrl: h.serverURL,
	})
}
