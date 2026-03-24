package board

import (
	"Buzz/internal/domain/board"
	"Buzz/internal/entity"
	"context"
	"encoding/json"
)

type BoardUseCase struct {
	boardRepo board.BoardRepository
}

func NewBoardUseCase(boardRepo board.BoardRepository) *BoardUseCase {
	return &BoardUseCase{boardRepo: boardRepo}
}

func (uc *BoardUseCase) SaveState(ctx context.Context, roomId string, content json.RawMessage) error {
	state := &entity.BoardState{
		RoomId:  roomId,
		Content: content,
	}

	if err := uc.boardRepo.Save(ctx, state); err != nil {
		return err
	}

	return nil
}

func (uc *BoardUseCase) GetState(ctx context.Context, roomId string) (json.RawMessage, error) {
	state, err := uc.boardRepo.GetByRoomId(ctx, roomId)
	if err != nil {
		return nil, err
	}
	if state == nil {
		return json.RawMessage([]byte("()")), nil
	}

	return state.Content, nil
}
