package friend

import (
	"Buzz/internal/app/friend"
	"Buzz/internal/middleware"
	"encoding/json"
	"errors"
	"log"
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

func (h *Handler) GetIncomingRequests(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	requests, err := h.friendUseCase.GetIncomingRequests(r.Context(), userId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("internal srver error"))
		return
	}

	h.writeJSON(w, http.StatusOK, requests)
}

func (h *Handler) AcceptFriendRequest(w http.ResponseWriter, r *http.Request) {
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

	err := h.friendUseCase.AcceptFriendRequest(r.Context(), userId, requestId)
	if err != nil {
		switch {
		case errors.Is(err, friend.ErrRequestNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, friend.ErrNotAuthorized):
			h.writeError(w, http.StatusForbidden, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) RejectFriendRequest(w http.ResponseWriter, r *http.Request) {
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

	err := h.friendUseCase.RejectFriendRequest(r.Context(), userId, requestId)
	if err != nil {
		switch {
		case errors.Is(err, friend.ErrRequestNotFound):
			h.writeError(w, http.StatusNotFound, err)
		case errors.Is(err, friend.ErrNotAuthorized):
			h.writeError(w, http.StatusForbidden, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetFriends(w http.ResponseWriter, r *http.Request) {
	log.Println("GetFriends handler called")
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	log.Printf("UserID from context: %s, ok: %v", userId, ok)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}
	log.Printf("Calling friendUseCase.GetFriends for user: %s", userId)
	friends, err := h.friendUseCase.GetFriends(r.Context(), userId)
	if err != nil {
		log.Printf("GetFriends error: %v", err)
		h.writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
		return
	}
	log.Printf("GetFriends returned %d friends", len(friends))
	var result []Friend
	for _, f := range friends {
		result = append(result, Friend{
			Id:       f.Id,
			Username: f.Username,
			Code:     f.Code,
			Avatar:   f.Avatar,
		})
	}
	h.writeJSON(w, http.StatusOK, result)
}
