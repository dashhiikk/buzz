package auth

import (
	"Buzz/internal/app/auth"
	"Buzz/internal/middleware"
	"encoding/json"
	"errors"
	"log"
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

func (h *Handler) CancelRegister(w http.ResponseWriter, r *http.Request) {
	var req cancelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("missing email"))
		return
	}

	if err := h.authUseCase.CancelRegister(r.Context(), req.Email); err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to cancel registration"))
		return
	}

	w.WriteHeader(http.StatusOK)
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

	token, err := h.authUseCase.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, auth.ErrInvalidUsername),
			errors.Is(err, auth.ErrInvalidCode),
			errors.Is(err, auth.ErrWeakPassword):
			h.writeError(w, http.StatusBadRequest, err)
		case errors.Is(err, auth.ErrUserNotFound),
			errors.Is(err, auth.ErrInvalidPassword):
			h.writeError(w, http.StatusUnauthorized, errors.New("invalid credentials"))
		case errors.Is(err, auth.ErrUserNotVerify):
			h.writeError(w, http.StatusForbidden, errors.New("Для входа в аккаунт необходимо подвердить почту"))
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
	log.Printf("Raw token handler: %q", req.Token)
	authToken, err := h.authUseCase.UpdatePasswordAndVerify(r.Context(), req.Token, req.NewPassword)
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

	h.writeJSON(w, http.StatusOK, TokenResponse{Token: authToken})
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

	authToken, err := h.authUseCase.VerifyEmailAndLogin(r.Context(), token)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid or expire token"))
		return
	}

	h.writeJSON(w, http.StatusOK, TokenResponse{Token: authToken})
}

func (h *Handler) ResendVerification(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request"))
		return
	}
	if err := h.authUseCase.ResendVerificationEmail(r.Context(), req.Email); err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to resend"))
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]string{"message": "verification email sent"})
}

// GetMe godoc
// @Summary      Получить информацию о текущем пользователе
// @Tags         auth
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} map[string]interface{} "id, email, username, code, avatar"
// @Failure      401 {object} ErrorResponse
// @Router       /auth/me [get]
func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	user, err := h.authUseCase.GetMeById(r.Context(), userId)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to get user"))
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"id":        user.Id,
		"email":     user.Email,
		"username":  user.Username,
		"code":      user.Code,
		"avatar":    user.Avatar,
		"phone":     user.Phone,
		"firstName": user.FirstName,
		"birthDate": user.BirthDate,
	})
}

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}
	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request"))
		return
	}
	updates := make(map[string]interface{})
	if req.Username != nil {
		updates["username"] = *req.Username
	}
	if req.Code != nil {
		updates["code"] = *req.Code
	}
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.Phone != nil {
		updates["phone"] = req.Phone
	}
	if req.FirstName != nil {
		updates["firstName"] = req.FirstName
	}
	if req.BirthDate != nil {
		updates["birthDate"] = *req.BirthDate
	}
	if req.Avatar != nil {
		updates["avatar"] = req.Avatar
	}
	errs, err := h.authUseCase.UpdateProfile(r.Context(), userID, updates)
	if err != nil {
		if errors.Is(err, auth.ErrUserNotFound) {
			h.writeError(w, http.StatusNotFound, err)
		}
		h.writeError(w, http.StatusInternalServerError, errors.New("failed to update user"))
	}
	if len(errs) > 0 {
		h.writeJSON(w, http.StatusBadRequest, map[string]interface{}{"errors": errs})
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]string{"message": "profile updated"})
}

func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIdKey).(string)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}
	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, errors.New("invalid request"))
		return
	}
	if err := h.authUseCase.ChangePassword(r.Context(), userID, req.OldPassword, req.NewPassword); err != nil {
		switch {
		case errors.Is(err, auth.ErrInvalidPassword),
			errors.Is(err, auth.ErrWeakPassword):
			h.writeError(w, http.StatusBadRequest, err)
		default:
			h.writeError(w, http.StatusInternalServerError, errors.New("failed to change password"))
		}
		return
	}
	w.WriteHeader(http.StatusOK)
}
