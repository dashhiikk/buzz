package chat

import (
	"Buzz/internal/domain/chat"
	"Buzz/internal/entity"
	"context"
)

type TextUseCase struct {
	msgRepo chat.TextRepository
}

func NewTextUseCase(msgRepo chat.TextRepository) *TextUseCase {
	return &TextUseCase{msgRepo: msgRepo}
}

func (uc *TextUseCase) SendMessage(ctx context.Context, roomId, senderId, text string, files []string) (*entity.Message, error) {
	msg := &entity.Message{
		RoomId:   roomId,
		SenderId: senderId,
		Text:     text,
		Files:    files,
	}

	if err := uc.msgRepo.CreateMessage(ctx, msg); err != nil {
		return nil, err
	}
	return msg, nil
}

func (uc *TextUseCase) GetHistory(ctx context.Context, roomId string, limit, offset int) ([]entity.Message, error) {
	messages, err := uc.msgRepo.GetHistory(ctx, roomId, limit, offset)
	if err != nil {
		return nil, err
	}

	return messages, nil
}
