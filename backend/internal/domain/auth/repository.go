package auth

import (
	"Buzz/internal/entity"
	"context"
)

type AuthRepository interface {
	CreateUser(ctx context.Context, user *entity.User, passwordHash string) error
	GetUserById(ctx context.Context, id string) (*entity.User, error)
	GetUserByUsernameAndCode(ctx context.Context, username, code string) (*entity.User, error)
	GetUserByEmail(ctx context.Context, email string) (*entity.User, error)
	UpdatePassword(ctx context.Context, userID, newPasswordHash string) error
	UpdateVerifiedStatus(ctx context.Context, userId string, verified bool) error
	DeleteUserByEmail(ctx context.Context, email string) error
	UpdateUser(ctx context.Context, user *entity.User) error
	CheckUserExistsByUsernameAndCode(ctx context.Context, username, code, excludeUserID string) (bool, error)
}
