package auth

import (
	"Buzz/internal/app/auth"
	"encoding/json"
	"errors"
	"net/http"
)

type Handler struct {
	authUseCase *auth.AuthUseCase
}

func NewHandler(useCase *auth.AuthUseCase) *Handler {
	return &Handler{authUseCase: useCase}
}

func (h *Handler) writeError(w http.ResponseWriter, status int, err error) {
	w.Header().Set("Contetnt-Type", "applicaton/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request body"))
		return
	}

	err := h.authUseCase.Register(r.Context(), req.Username, req.Email, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, auth.ErrInvalidUsername),
			errors.Is(err, auth.ErrInvalidEmail),
			errors.Is(err, auth.ErrWeakPassword):
			h.writeError(w, http.StatusBadRequest, err)
		case errors.Is(err, auth.ErrUserExists):
			h.writeError(w, http.StatusConflict, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request body"))
		return
	}

	token, err := h.authUseCase.Login(r.Context(), req.Username, req.Code, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, auth.ErrInvalidUsername),
			errors.Is(err, auth.ErrInvalidCode),
			errors.Is(err, auth.ErrWeakPassword):
			h.writeError(w, http.StatusBadRequest, err)
		case errors.Is(err, auth.ErrUserNotFound),
			errors.Is(err, auth.ErrInvalidPassword):
			h.writeError(w, http.StatusUnauthorized, errors.New("invalid credentials"))
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
		}
		return
	}

	h.writeJSON(w, http.StatusOK, TokenResponse{Token: token})
}

func (h *Handler) RequestPasswordReset(w http.ResponseWriter, r *http.Request) {
	var req PasswordResetRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request body"))
		return
	}

	err := h.authUseCase.RequestPasswordReset(r.Context(), req.Email)
	if err != nil {
		h.writeJSON(w, http.StatusAccepted, map[string]string{"message": "if email exists, reset link sent"})
		return
	}

	h.writeJSON(w, http.StatusAccepted, map[string]string{"message": "if email exists, reset link sent"})

}

func (h *Handler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ResetPasswordRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request body"))
		return
	}

	err := h.authUseCase.ResetPassword(r.Context(), req.Token, req.NewPassword)
	if err != nil {
		switch {
		case errors.Is(err, auth.ErrWeakPassword):
			h.writeError(w, http.StatusBadRequest, err)
		case errors.Is(err, auth.ErrTokenExpired):
			h.writeError(w, http.StatusUnauthorized, errors.New("token expired"))
		case errors.Is(err, auth.ErrTokenInvalid):
			h.writeError(w, http.StatusUnauthorized, errors.New("invalid token"))
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("internal server error"))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}
