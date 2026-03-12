package room

import (
	"Buzz/internal/entity"
	"context"
)

type UserRepository interface {
	GetUserById(ctx context.Context, id string) (*entity.User, error)
	GetUserByUsernameAndCode(ctx context.Context, username, code string) (*entity.User, error)
}
