package room

import (
	"Buzz/internal/app/room"
	"Buzz/internal/middleware"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	roomUseCase *room.RoomUseCase
}

func NewHandler(roomUseCase *room.RoomUseCase) *Handler {
	return &Handler{roomUseCase: roomUseCase}
}

func (h *Handler) writeError(w http.ResponseWriter, status int, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Contetnt-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// CreateRoom godoc
// @Summary      Создать новую комнату
// @Description  Создаёт комнату с указанным названием (и опциональной иконкой). Текущий пользователь становится администратором и первым участником.
// @Tags         rooms
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body CreateRoomRequest true "Данные комнаты"
// @Success      201 "Комната создана"
// @Failure      400 {object} map[string]string "Некорректные данные"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /rooms/create [post]
func (h *Handler) CreateRoom(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	var req CreateRoomRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request body"))
		return
	}

	if err := h.roomUseCase.CreateRoom(r.Context(), req.Name, req.Icon, userId); err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to create room"))
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// GetUserRooms godoc
// @Summary      Получить список комнат пользователя
// @Description  Возвращает все комнаты, в которых участвует текущий пользователь. Для приватных комнат название и иконка заменяются на данные собеседника.
// @Tags         rooms
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} RoomResponse "Список комнат"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /rooms [get]
func (h *Handler) GetUserRooms(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	rooms, err := h.roomUseCase.GetUserRooms(r.Context(), userId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to get rooms"))
		return
	}

	h.writeJSON(w, http.StatusOK, rooms)
}

// GetRoom godoc
// @Summary      Получить информацию о комнате
// @Description  Возвращает детали комнаты по ID (доступно любому пользователю, даже не участнику, но возвращает базовую информацию).
// @Tags         rooms
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "ID комнаты"
// @Success      200 {object} RoomResponse "Информация о комнате"
// @Failure      400 {object} map[string]string "Неверный ID"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      404 {object} map[string]string "Комната не найдена"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /rooms/{id} [get]
func (h *Handler) GetRoom(w http.ResponseWriter, r *http.Request) {
	roomId := chi.URLParam(r, "id")
	if roomId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing room id"))
		return
	}

	rm, err := h.roomUseCase.GetRoom(r.Context(), roomId)
	if err != nil {
		switch {
		case errors.Is(err, room.ErrRoomNotFound):
			h.writeError(w, http.StatusNotFound, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to get room"))
		}
		return
	}

	resp := RoomResponse{
		Id:        rm.Id,
		Name:      rm.Name,
		Icon:      rm.Icon,
		AdminId:   rm.AdminId,
		CreatedAt: rm.CreatedAt,
	}

	h.writeJSON(w, http.StatusOK, resp)
}

// GetParticipants godoc
// @Summary      Получить список участников комнаты
// @Description  Возвращает всех участников указанной комнаты.
// @Tags         rooms
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "ID комнаты"
// @Success      200 {array} ParticipantResponse "Список участников"
// @Failure      400 {object} map[string]string "Неверный ID"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /rooms/{id}/participants [get]
func (h *Handler) GetParticipants(w http.ResponseWriter, r *http.Request) {
	roomId := chi.URLParam(r, "id")
	if roomId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing room id"))
		return
	}

	participants, err := h.roomUseCase.GetParticipants(r.Context(), roomId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to get participants"))
		return
	}

	var resp []ParticipantResponse
	for _, p := range participants {
		resp = append(resp, ParticipantResponse{
			Id:       p.Id,
			Username: p.Username,
			Code:     p.Code,
			Avatar:   p.Avatar,
		})
	}

	h.writeJSON(w, http.StatusOK, resp)
}

// SendRoomInvite godoc
// @Summary      Отправить приглашение в комнату
// @Description  Отправляет запрос на вступление в комнату другому пользователю. Приглашающий должен быть участником комнаты.
// @Tags         rooms
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path string true "ID комнаты"
// @Param        request body SendRoomInviteRequest true "Данные приглашаемого"
// @Success      201 "Приглашение отправлено"
// @Failure      400 {object} map[string]string "Некорректные данные или попытка пригласить себя"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      403 {object} map[string]string "Пользователь не является участником комнаты"
// @Failure      404 {object} map[string]string "Комната или пользователь не найдены"
// @Failure      409 {object} map[string]string "Пользователь уже участник или приглашение уже существует"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /rooms/{id}/send-invite [post]
func (h *Handler) SendRoomInvite(w http.ResponseWriter, r *http.Request) {
	inviterId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	roomId := chi.URLParam(r, "id")
	if roomId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing room id"))
		return
	}

	var req SendRoomInviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request body"))
		return
	}

	err := h.roomUseCase.SendRoomInvite(r.Context(), inviterId, roomId, req.Username, req.Code)
	if err != nil {
		switch {
		case errors.Is(err, room.ErrRoomNotFound),
			errors.Is(err, room.ErrUserNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, room.ErrNotInRoom),
			errors.Is(err, room.ErrCannotInviteSelf):
			h.writeError(w, http.StatusForbidden, err)
		case errors.Is(err, room.ErrAlreadyParticipant),
			errors.Is(err, room.ErrInviteAlreadyExists):
			h.writeError(w, http.StatusConflict, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// JoinRoomByInviteLink godoc
// @Summary      Вступить в комнату по ссылке-приглашению
// @Description  Позволяет пользователю немедленно присоединиться к комнате (без ожидания подтверждения). Комната должна существовать.
// @Tags         rooms
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "ID комнаты"
// @Success      200 "Успешное вступление"
// @Failure      400 {object} map[string]string "Неверный ID"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      404 {object} map[string]string "Комната не найдена"
// @Failure      409 {object} map[string]string "Пользователь уже участник"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /rooms/{id}/join [post]
func (h *Handler) JoinRoomByInviteLink(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unathorized"))
		return
	}

	roomId := chi.URLParam(r, "id")
	if roomId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing room id"))
		return
	}

	err := h.roomUseCase.JoinRoomByInviteLink(r.Context(), roomId, userId)
	if err != nil {
		switch {
		case errors.Is(err, room.ErrRoomNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, room.ErrAlreadyParticipant):
			h.writeError(w, http.StatusConflict, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to join room by link"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

// RemoveParticipant godoc
// @Summary      Удалить участника из комнаты
// @Description  Удаляет указанного пользователя из комнаты. Доступно только администратору комнаты.
// @Tags         rooms
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "ID комнаты"
// @Param        userId path string true "ID пользователя для удаления"
// @Success      200 "Участник удалён"
// @Failure      400 {object} map[string]string "Неверные параметры или попытка удалить себя"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      403 {object} map[string]string "Пользователь не администратор"
// @Failure      404 {object} map[string]string "Комната не найдена"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /rooms/{id}/participants/{userId} [delete]
func (h *Handler) RemoveParticipant(w http.ResponseWriter, r *http.Request) {
	adminId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	roomId := chi.URLParam(r, "id")
	userToRemove := chi.URLParam(r, "userId")
	if roomId == "" || userToRemove == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missind id"))
		return
	}

	err := h.roomUseCase.RemoveParticipant(r.Context(), roomId, adminId, userToRemove)
	if err != nil {
		switch {
		case errors.Is(err, room.ErrRoomNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, room.ErrNotAdmin):
			h.writeError(w, http.StatusForbidden, err)
		case errors.Is(err, room.ErrCannotRemoveSelf):
			h.writeError(w, http.StatusBadRequest, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to remove participant"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

// AppointAdmin godoc
// @Summary      Назначить нового администратора комнаты
// @Description  Передаёт права администратора другому участнику комнаты. Доступно только текущему администратору.
// @Tags         rooms
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path string true "ID комнаты"
// @Param        request body AppointAdminRequest true "ID нового администратора"
// @Success      200 "Администратор назначен"
// @Failure      400 {object} map[string]string "Неверные данные"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      403 {object} map[string]string "Пользователь не администратор"
// @Failure      404 {object} map[string]string "Комната не найдена"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /rooms/{id}/admin [post]
func (h *Handler) AppointAdmin(w http.ResponseWriter, r *http.Request) {
	currentAdminId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	roomId := chi.URLParam(r, "id")
	if roomId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing room id"))
		return
	}

	var req AppointAdminRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request body"))
		return
	}

	err := h.roomUseCase.AppointAdmin(r.Context(), roomId, currentAdminId, req.NewAdminID)
	if err != nil {
		switch {
		case errors.Is(err, room.ErrRoomNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, room.ErrNotAdmin):
			h.writeError(w, http.StatusForbidden, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to appoint admin"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

// DeleteRoom godoc
// @Summary      Удалить комнату
// @Description  Полностью удаляет комнату. Доступно только администратору комнаты.
// @Tags         rooms
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "ID комнаты"
// @Success      200 "Комната удалена"
// @Failure      400 {object} map[string]string "Неверный ID"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      403 {object} map[string]string "Пользователь не администратор"
// @Failure      404 {object} map[string]string "Комната не найдена"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /rooms/{id} [delete]
func (h *Handler) DeleteRoom(w http.ResponseWriter, r *http.Request) {
	adminId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	roomId := chi.URLParam(r, "id")
	if roomId == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing room id"))
		return
	}

	err := h.roomUseCase.DeleteRoom(r.Context(), roomId, adminId)
	if err != nil {
		switch {
		case errors.Is(err, room.ErrRoomNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, room.ErrNotAdmin):
			h.writeError(w, http.StatusForbidden, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to delete room"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

// LeaveRoom godoc
// @Summary      Покинуть комнату
// @Description  Выход текущего пользователя из комнаты. Если комната приватная, она будет удалена, а дружба разорвана. Если администратор покидает публичную комнату, права передаются другому участнику.
// @Tags         rooms
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "ID комнаты"
// @Success      200 "Выход выполнен"
// @Failure      400 {object} map[string]string "Неверный ID"
// @Failure      401 {object} map[string]string "Неавторизован"
// @Failure      403 {object} map[string]string "Пользователь не является участником"
// @Failure      404 {object} map[string]string "Комната не найдена"
// @Failure      500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router       /rooms/{id}/leave [post]
func (h *Handler) LeaveRoom(w http.ResponseWriter, r *http.Request) {
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

	err := h.roomUseCase.LeaveRoom(r.Context(), userId, roomId)
	if err != nil {
		switch {
		case errors.Is(err, room.ErrNotInRoom):
			h.writeError(w, http.StatusForbidden, err)
		case errors.Is(err, room.ErrRoomNotFound):
			h.writeError(w, http.StatusNotFound, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to leave room"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}
