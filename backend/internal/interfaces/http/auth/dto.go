package auth

// RegisterRequest - форма запроса на регистрацию
type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginRequest - форма запроса на авторизацию
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// PasswordResetRequest - форма запроса на восстановление пароля
type PasswordResetRequest struct {
	Email string `json:"email"`
}

// UpdatePasswordRequest - форма запроса на смену пароля
type UpdatePasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"newPassword"`
}

// TokenResponse - ответ с токеном
type TokenResponse struct {
	Token string `json:"token"`
}

// ErrorResponse - ответ с ошибкой
type ErrorResponse struct {
	Error string `json:"error"`
}

type cancelRequest struct {
	Email string `json:"email"`
}
