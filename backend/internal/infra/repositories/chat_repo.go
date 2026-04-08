package repositories

import (
	"Buzz/internal/entity"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type ChatRepository struct {
	db *sqlx.DB
}

func NewChatRepository(db *sqlx.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) CreateMessage(ctx context.Context, msg *entity.Message) error {
	filesJSON, err := json.Marshal(msg.Files)
	if err != nil {
		return fmt.Errorf("marshal files: %w", err)
	}

	query := `
		INSERT INTO messages (id, room_id, sender_id, text, files, created_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
		RETURNING id, created_at  
	`
	row := r.db.QueryRowContext(ctx, query, msg.RoomId, msg.SenderId, msg.Text, filesJSON)
	if err := row.Scan(&msg.Id, &msg.CreatedAt); err != nil {
		return fmt.Errorf("create message: %w", err)
	}

	return nil
}

func (r *ChatRepository) GetHistory(ctx context.Context, roomId string, limit, offset int) ([]entity.Message, error) {
	var messages []entity.Message

	query := `
		SELECT id, room_id, sender_id, text, files, created_at
		FROM messages
		WHERE room_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryxContext(ctx, query, roomId, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("get history: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var msg entity.Message
		var filesJSON []byte

		err := rows.Scan(&msg.Id, &msg.RoomId, &msg.SenderId, &msg.Text, &filesJSON, &msg.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("scan message: %w", err)
		}

		if err := json.Unmarshal(filesJSON, &msg.Files); err != nil {
			msg.Files = []string{}
		}

		messages = append(messages, msg)
	}

	return messages, nil
}

func (r *ChatRepository) DeleteMessage(ctx context.Context, messageId string) error {
	query := `DELETE FROM messages WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query, messageId)
	if err != nil {
		return fmt.Errorf("delete message: %w", err)
	}

	return nil
}

func (r *ChatRepository) PinMessage(ctx context.Context, roomId, messageId string) error {
	query := `UPDATE rooms SET pinned_message_id = $1 WHERE id = $2`

	_, err := r.db.ExecContext(ctx, query, messageId, roomId)
	if err != nil {
		return fmt.Errorf("pin message: %w", err)
	}

	return nil
}

func (r *ChatRepository) GetPinnedMessage(ctx context.Context, roomId string) (*entity.Message, error) {
	query := `
		SELECT m.id, m.room_id, m.sender_id, m.text, m.files, m.created_at
		FROM messages m
		JOIN rooms r ON r.pinned_message_id = m.id
		WHERE r.id = $1
	`
	var msg entity.Message
	err := r.db.GetContext(ctx, &msg, query, roomId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("get pinned message: %w", err)
	}

	return &msg, nil
}

func (r *ChatRepository) GetMessageById(ctx context.Context, id string) (*entity.Message, error) {
	query := `
		SELECT id, room_id, sender_id, text, files, created_at
		FROM messages 
		WHERE id = $1
	`
	var msg entity.Message
	err := r.db.GetContext(ctx, &msg, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	return &msg, nil
}
