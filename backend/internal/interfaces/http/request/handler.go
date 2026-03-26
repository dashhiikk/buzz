package ruquest

import (
	"Buzz/internal/app/request"
	"Buzz/internal/middleware"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	requestUseCase *request.RequestUseCase
}

func NewHandler(uc *request.RequestUseCase) *Handler {
	return &Handler{requestUseCase: uc}
}

func (h *Handler) writeError(w http.ResponseWriter, status int, err error) {
	w.Header().Set("Context-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Context-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// GetIncomingRequests godoc
// @Summary      Получить все входящие запросы
// @Description  Возвращает список ожидающих запросов (в друзья и приглашения в комнаты) для текущего пользователя. Ответ содержит поля, зависящие от типа запроса.
// @Tags         requests
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} request.Request "Список входящих запросов (может быть пустым)"
// @Failure      401 "Неавторизован"
// @Failure      500 "Внутренняя ошибка сервера"
// @Router       /requests [get]
func (h *Handler) GetIncomingRequests(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	resp, err := h.requestUseCase.GetIncomingRequests(r.Context(), userId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to get incoming requests"))
		return
	}

	h.writeJSON(w, http.StatusOK, resp)
}

// GetOutgoingRequests godoc
// @Summary      Получить все исходящие запросы
// @Description  Возвращает список отправленных запросов (в друзья и приглашения в комнаты) для текущего пользователя. Ответ содержит поля, зависящие от типа запроса.
// @Tags         requests
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} request.Request "Список исходящих запросов (может быть пустым)"
// @Failure      401 "Неавторизован"
// @Failure      500 "Внутренняя ошибка сервера"
// @Router       /requests/outgoing [get]
func (h *Handler) GetOutgoingRequests(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	resp, err := h.requestUseCase.GetOutgoingRequests(r.Context(), userId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to get outgoing requests"))
		return
	}

	h.writeJSON(w, http.StatusOK, resp)
}

// @Summary      Принять запрос
// @Description  Принимает запрос (в друзья или приглашение в комнату) по его ID. После принятия пользователь становится другом или участником комнаты.
// @Tags         requests
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "ID запроса"
// @Success      200 "Запрос принят"
// @Failure      400 "Неверный ID запроса или запрос не в статусе pending"
// @Failure      401 "Неавторизован"
// @Failure      403 "Запрос не принадлежит текущему пользователю"
// @Failure      404 "Запрос не найден"
// @Failure      409 "Запрос уже был обработан (не pending)"
// @Failure      500 "Внутренняя ошибка сервера"
// @Router       /requests/{id}/accept [post]
func (h *Handler) AcceptRequest(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	requestId := chi.URLParam(r, "id")
	if requestId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing request id"))
		return
	}

	err := h.requestUseCase.AcceptRequest(r.Context(), userId, requestId)
	if err != nil {
		switch {
		case errors.Is(err, request.ErrRequestNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, request.ErrNotAuthorized):
			h.writeError(w, http.StatusForbidden, err)
		case errors.Is(err, request.ErrRequestNotPending):
			h.writeError(w, http.StatusConflict, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to accept request"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

// RejectRequest godoc
// @Summary      Отклонить запрос
// @Description  Отклоняет запрос (в друзья или приглашение в комнату) по его ID. Запрос удаляется.
// @Tags         requests
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "ID запроса"
// @Success      200 "Запрос отклонён"
// @Failure      400 "Неверный ID запроса"
// @Failure      401 "Неавторизован"
// @Failure      403 "Запрос не принадлежит текущему пользователю"
// @Failure      404 "Запрос не найден"
// @Failure      500 "Внутренняя ошибка сервера"
// @Router       /requests/{id}/reject [post]
func (h *Handler) RejectRequest(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	requestId := chi.URLParam(r, "id")
	if requestId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing request id"))
		return
	}

	err := h.requestUseCase.AcceptRequest(r.Context(), userId, requestId)
	if err != nil {
		switch {
		case errors.Is(err, request.ErrRequestNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, request.ErrNotAuthorized):
			h.writeError(w, http.StatusForbidden, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to reject request"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) CancelRequest(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	requestId := chi.URLParam(r, "id")
	if requestId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing request id"))
		return
	}

	err := h.requestUseCase.CancelRequest(r.Context(), userId, requestId)
	if err != nil {
		switch {
		case errors.Is(err, request.ErrRequestNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, request.ErrNotAuthorized):
			h.writeError(w, http.StatusForbidden, err)
		case errors.Is(err, request.ErrRequestNotPending):
			h.writeError(w, http.StatusConflict, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to cancel request"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}
