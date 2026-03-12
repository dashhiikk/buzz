package friend

import (
	"Buzz/internal/entity"
	"context"
)

type FriendRepository interface {
	GetUserById(ctx context.Context, id string) (*entity.User, error)
	GetUserByUsernameAndCode(ctx context.Context, username, code string) (*entity.User, error)
}
