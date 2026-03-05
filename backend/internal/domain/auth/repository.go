package auth

import (
	"Buzz/internal/entity"
	"context"
)

type AuthRepository interface {
	CreateUser(ctx context.Context, user *entity.User, passwordHash string) error
	GetUserByUsernameAndCode(ctx context.Context, username, code string) (*entity.User, error)
	GetUserByEmail(ctx context.Context, email string) (*entity.User, error)
	UpdatePassword(ctx context.Context, userID, newPasswordHash string) error
}
