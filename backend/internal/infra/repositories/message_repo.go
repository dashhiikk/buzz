package repositories

import (
	"Buzz/internal/entity"
	"context"
	"encoding/json"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type MessageRepository struct {
	db *sqlx.DB
}

func NewMessageRepository(db *sqlx.DB) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r MessageRepository) Create(ctx context.Context, msg *entity.Message) error {
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
		return fmt.Errorf("create massage: %w", err)
	}

	return nil
}

func (r *MessageRepository) GetHistory(ctx context.Context, roomId string, limit, offset int) ([]entity.Message, error) {
	var messages []entity.Message

	query := `
		SELEST id, room_id, sender_id, text, files, created_at
		FROM messages
		WHERE room_id = $1
		ORDER BY created_at DSEC
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
