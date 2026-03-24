package repositories

import (
	"Buzz/internal/entity"
	"context"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type BoardRepository struct {
	db *sqlx.DB
}

func NewBoardRepository(db *sqlx.DB) *BoardRepository {
	return &BoardRepository{db: db}
}

func (r *BoardRepository) Save(ctx context.Context, state *entity.BoardState) error {
	query := `
		INSERT INTO board_states (room_id, content, updated_at)
		VALUES ($1, $2, $3)
		ON CONFLICT (room_id) DO UPDATE
		SET content = EXCLUDED.content, updated_at = NOW()
	`
	_, err := r.db.ExecContext(ctx, query, state.RoomId, state.Content, state.UpdatedAt)
	if err != nil {
		return fmt.Errorf("save board state: %w", err)
	}

	return nil
}

func (r *BoardRepository) GetByRoomId(ctx context.Context, roomId string) (*entity.BoardState, error) {
	query := `
		SELECT room_id, content, updated_at
		FROM board_states
		WHERE room_id = $1 
	`
	var board entity.BoardState
	err := r.db.GetContext(ctx, &board, query, roomId)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get board state: %w", err)
	}

	return &board, nil
}
