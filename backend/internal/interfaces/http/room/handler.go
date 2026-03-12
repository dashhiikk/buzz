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

	var resp []RoomResponse
	for _, rm := range rooms {
		resp = append(resp, RoomResponse{
			Id:   rm.Id,
			Name: rm.Name,
			Icon: rm.Icon,
		})
	}

	h.writeJSON(w, http.StatusOK, resp)
}

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

}
