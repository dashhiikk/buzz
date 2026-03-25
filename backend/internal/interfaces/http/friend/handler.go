package friend

import (
	"Buzz/internal/app/friend"
	"Buzz/internal/middleware"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	friendUseCase *friend.FriendUseCase
}

func NewHandler(uc *friend.FriendUseCase) *Handler {
	return &Handler{friendUseCase: uc}
}

func (h *Handler) writeError(w http.ResponseWriter, status int, err error) {
	w.Header().Set("Content-type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// GetFriends godoc
// @Summary      Получить список друзей
// @Description  Возвращает массив друзей текущего пользователя. Друзьями считаются пользователи, с которыми есть принятый запрос (status='accepted').
// @Tags         friends
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} FriendResponse "Список друзей (может быть пустым)"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /friends [get]
func (h *Handler) GetFriends(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	friends, err := h.friendUseCase.GetFriends(r.Context(), userId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
		return
	}

	var result []FriendResponse
	for _, f := range friends {
		result = append(result, FriendResponse{
			Id:       f.Id,
			Username: f.Username,
			Code:     f.Code,
			Avatar:   f.Avatar,
		})
	}
	h.writeJSON(w, http.StatusOK, result)
}

// SendFriendRequest godoc
// @Summary      Отправить запрос в друзья
// @Description  Создаёт новый запрос на добавление в друзья для указанного пользователя (по никнейму и коду).
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body SendFriendRequest true "Данные получателя"
// @Success      201 "Запрос создан (тело ответа пусто)"
// @Failure      400 {object} map[string]string "Некорректные данные (username/code) или попытка отправить запрос самому себе"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      404 {object} map[string]string "Пользователь не найден"
// @Failure      409 {object} map[string]string "Запрос уже существует"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /friends/send-request [post]
func (h *Handler) SendFriendRequest(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	var req SendFriendRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request body"))
		return
	}

	err := h.friendUseCase.SendFriendRequest(r.Context(), userId, req.Username, req.Code)
	if err != nil {
		switch {
		case errors.Is(err, friend.ErrUserNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, friend.ErrFriendRequestToSelf):
			h.writeError(w, http.StatusBadRequest, err)
		case errors.Is(err, friend.ErrFriendRequestExists):
			h.writeError(w, http.StatusConflict, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// RemoveFriend godoc
// @Summary      Удалить друга
// @Description  Удаляет связь дружбы между текущим пользователем и указанным пользователем. При этом также удаляется приватная комната.
// @Tags         friends
// @Security     BearerAuth
// @Param        friendId path string true "ID пользователя, которого нужно удалить из друзей"
// @Success      200 "Друг удалён"
// @Failure      400 {object} map[string]string "Пользователи не являются друзьями"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      404 {object} map[string]string "Пользователь не найден"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /friends/{friendId} [delete]
func (h *Handler) RemoveFriend(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	friendId := chi.URLParam(r, "friendId")
	if friendId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing friend id"))
		return
	}

	err := h.friendUseCase.RemoveFriend(r.Context(), userId, friendId)
	if err != nil {
		switch {
		case errors.Is(err, friend.ErrUserNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, friend.ErrNotFriends):
			h.writeError(w, http.StatusBadRequest, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to remove friend"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}
