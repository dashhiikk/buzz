package board

import (
	"Buzz/internal/entity"
	"context"
)

type BoardRepository interface {
	Save(ctx context.Context, state *entity.BoardState) error
	GetByRoomId(ctx context.Context, roomId string) (*entity.BoardState, error)
}
