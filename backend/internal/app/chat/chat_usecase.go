package chat

import (
	"Buzz/internal/domain/chat"
	"Buzz/internal/domain/room"
	"Buzz/internal/entity"
	"context"
	"database/sql"
	"errors"
	"log"
	"strings"
)

var (
	ErrMessageNotFound = errors.New("Сообщение не найдено")
	ErrUserNotSender   = errors.New("Пользователь может удалить только своё сообщение")
)

type ChatUseCase struct {
	msgRepo  chat.ChatRepository
	roomRepo room.RoomRepository
}

func NewChatUseCase(msgRepo chat.ChatRepository, roomRepo room.RoomRepository) *ChatUseCase {
	return &ChatUseCase{msgRepo: msgRepo, roomRepo: roomRepo}
}

func (uc *ChatUseCase) SendMessage(ctx context.Context, roomId, senderId, text string, files []entity.MessageFile) (*entity.Message, error) {
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

func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return strings.TrimSpace(s[:maxLen]) + "..."
}

func (uc *ChatUseCase) GetHistory(ctx context.Context, roomId string, limit, offset int) ([]entity.MessageForHistory, error) {
	messages, err := uc.msgRepo.GetHistory(ctx, roomId, limit, offset)
	if err != nil {
		return nil, err
	}

	return messages, nil
}

func (uc *ChatUseCase) DeleteMessage(ctx context.Context, messageId, userId string) error {
	msg, err := uc.msgRepo.GetMessageById(ctx, messageId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrMessageNotFound
		}
		return err
	}

	if userId != msg.SenderId {
		return ErrUserNotSender
	}

	return uc.msgRepo.DeleteMessage(ctx, messageId)
}

func (uc *ChatUseCase) PinMessage(ctx context.Context, messageId, roomId string) error {
	err := uc.msgRepo.PinMessage(ctx, roomId, messageId)
	if err != nil {
		log.Printf("GetPinnedMessage in usecase error: %v", err)
	}
	return nil
}

func (uc *ChatUseCase) UnpinMessage(ctx context.Context, roomId string) error {
	return uc.msgRepo.UnpinMessage(ctx, roomId)
}

func (uc *ChatUseCase) GetPinnedMessage(ctx context.Context, roomId string) (*entity.Message, error) {

	return uc.msgRepo.GetPinnedMessage(ctx, roomId)
}

func (uc *ChatUseCase) GetMessageById(ctx context.Context, messageId string) (*entity.Message, error) {
	return uc.msgRepo.GetMessageById(ctx, messageId)
}
