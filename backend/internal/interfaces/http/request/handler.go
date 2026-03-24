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
