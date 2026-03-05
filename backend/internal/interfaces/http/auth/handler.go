package auth

import "Buzz/internal/app/auth"

type Handler struct {
	authUseCase *auth.AuthUseCase
}

func NewHandler(useCase *auth.AuthUseCase) *Handler {
	return &Handler{authUseCase: useCase}
}
