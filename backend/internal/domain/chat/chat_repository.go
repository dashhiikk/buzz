package chat

import (
	"Buzz/internal/entity"
	"context"
)

type ChatRepository interface {
	CreateMessage(ctx context.Context, msg *entity.Message) error
	GetHistory(ctx context.Context, roomId string, limit, offset int) ([]entity.Message, error)
}
