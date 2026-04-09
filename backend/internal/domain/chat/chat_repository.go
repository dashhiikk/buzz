package chat

import (
	"Buzz/internal/entity"
	"context"
)

type ChatRepository interface {
	CreateMessage(ctx context.Context, msg *entity.Message) error
	GetHistory(ctx context.Context, roomId string, limit, offset int) ([]entity.MessageForHistory, error)
	DeleteMessage(ctx context.Context, messageId string) error
	PinMessage(ctx context.Context, roomId, messageId string) error
	UnpinMessage(ctx context.Context, roomId string) error
	GetPinnedMessage(ctx context.Context, roomId string) (*entity.Message, error)
	GetMessageById(ctx context.Context, id string) (*entity.Message, error)
}
