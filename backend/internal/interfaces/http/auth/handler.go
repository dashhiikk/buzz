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

// Register godoc
// @Summary      Регистрация нового пользователя
// @Description  Создаёт нового пользователя и отправляет письмо с подтверждением
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body RegisterRequest true "Данные для регистрации"
// @Success      201	"Пользователь создан"
// @Failure      400  "Некорректный формат данных"
// @Failure      409  "Неверные учётные данные"
// @Router       /auth/register [post]
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

// Login godoc
// @Summary      Авторизация пользователя
// @Description  Авторизирует пользователя в приложении и выдает JWT-token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body LoginRequest true "Данные для авторизации"
// @Success      200  {object}  TokenResponse   "Пользователь авторизирован"
// @Failure      400 "Некорректный формат данных"
// @Failure      401 "Неверные учётные данные"
// @Router       /auth/login [post]
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

// RequestPasswordReset godoc
// @Summary      Запрос на восстановление пароля
// @Description  Отправляет ссылку-подтверждение для восстановления пароля
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body PasswordResetRequest true "Email пользователя"
// @Success      202 "Ссылка-подверждение отправлена"
// @Failure      400 "Некорректный email"
// @Router       /auth/password-reset [post]
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

// UpdatePassword godoc
// @Summary      Установка нового пароля
// @Description  Меняет пароль пользователя на новый
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body UpdatePasswordRequest true "Токен и новый пароль"
// @Success      200 "Пароль успешно изменён"
// @Failure      400 "Некорректный пароль"
// @Failure      401 "Недействительный или просроченный токен"
// @Router       /auth/update-password [post]
func (h *Handler) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	var req UpdatePasswordRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request body"))
		return
	}

	err := h.authUseCase.UpdatePassword(r.Context(), req.Token, req.NewPassword)
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

// VerifyEmail godoc
// @Summary      Подтверждение email
// @Description  Активирует учётную запись после перехода по ссылке из письма.
// @Tags         auth
// @Param        token query string true "JWT-токен подтверждения"
// @Success      200 {object} map[string]string "Email verified"
// @Failure      400 {object} ErrorResponse "Неверный токен"
// @Router       /auth/verify [get]
func (h *Handler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		h.writeError(w, http.StatusBadRequest, errors.New("missing token"))
		return
	}

	err := h.authUseCase.VerifyEmail(r.Context(), token)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid or expire token"))
		return
	}

	w.WriteHeader(http.StatusOK)
}
