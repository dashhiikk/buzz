package chat

import (
	"Buzz/internal/domain/chat"
	"Buzz/internal/domain/room"
	"Buzz/internal/entity"
	ws "Buzz/internal/infra/websocket"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"strings"
)

var (
	ErrMessageNotFound = errors.New("Сообщение не найдено")
	ErrUserNotSender   = errors.New("Пользователь можкт удлаить только своё сообщение")
)

type ChatUseCase struct {
	msgRepo         chat.ChatRepository
	roomRepo        room.RoomRepository
	notificationHub *ws.NotificationHub
}

func NewChatUseCase(msgRepo chat.ChatRepository, roomRepo room.RoomRepository, notificationHub *ws.NotificationHub) *ChatUseCase {
	return &ChatUseCase{msgRepo: msgRepo,
		roomRepo:        roomRepo,
		notificationHub: notificationHub,
	}
}

func (uc *ChatUseCase) SendMessage(ctx context.Context, roomId, senderId, text string, files []string) (*entity.Message, error) {
	msg := &entity.Message{
		RoomId:   roomId,
		SenderId: senderId,
		Text:     text,
		Files:    files,
	}

	if err := uc.msgRepo.CreateMessage(ctx, msg); err != nil {
		return nil, err
	}

	if uc.notificationHub != nil {
		participants, err := uc.roomRepo.GetParticipants(ctx, roomId)
		if err != nil {
			log.Printf("failed to get participants for notification: %v", err)
			return msg, nil
		}

		notif := map[string]interface{}{
			"type": "new_message",
			"data": map[string]interface{}{
				"roomId":    roomId,
				"messageId": msg.Id,
				"senderId":  senderId,
				"preview":   truncateString(text, 100),
				"timestamp": msg.CreatedAt,
			},
		}
		payload, err := json.Marshal(notif)
		if err != nil {
			log.Printf("failed to marshal notification: %v", err)
			return msg, nil
		}

		for _, p := range participants {
			if p.Id != senderId {
				uc.notificationHub.SendToUser(p.Id, payload)
			}
		}
	}

	return msg, nil
}

func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return strings.TrimSpace(s[:maxLen]) + "..."
}

func (uc *ChatUseCase) GetHistory(ctx context.Context, roomId string, limit, offset int) ([]entity.Message, error) {
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
	return uc.msgRepo.PinMessage(ctx, roomId, messageId)
}

func (uc *ChatUseCase) GetPinnedMessage(ctx context.Context, roomId string) (*entity.Message, error) {
	return uc.msgRepo.GetPinnedMessage(ctx, roomId)
}
