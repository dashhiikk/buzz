package repositories

import (
	"Buzz/internal/entity"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
)

type RoomRepository struct {
	db *sqlx.DB
}

func NewRoomRepository(db *sqlx.DB) *RoomRepository {
	return &RoomRepository{db: db}
}

func (r *RoomRepository) CreateRoom(ctx context.Context, room *entity.Room) error {
	query := `
		INSERT INTO rooms (id, name, icon, admin_id, created_at, is_private)
		VALUES (gen_random_uuid(), $1, $2, $3, NOW(), $4)
		RETURNING id, created_at
	`
	row := r.db.QueryRowContext(ctx, query, room.Name, room.Icon, room.AdminId, room.IsPrivate)
	err := row.Scan(&room.Id, &room.CreatedAt)
	if err != nil {
		return fmt.Errorf("create room: %w", err)
	}
	return nil
}

func (r *RoomRepository) GetRoomById(ctx context.Context, id string) (*entity.Room, error) {
	var room entity.Room
	query := `
		SELECT id, name, icon, admin_id, created_at
		FROM rooms
		WHERE id = $1
	`
	err := r.db.GetContext(ctx, &room, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("get room by id: %w", err)
	}

	return &room, nil
}

func (r *RoomRepository) GetByUser(ctx context.Context, userId string) ([]entity.Room, error) {
	var rooms []entity.Room
	query := `
		SELECT r.id, r.name, r.icon, r.admin_id, r.created_at
		FROM rooms r
		JOIN room_participants rp ON r.id = rp.room_id
		WHERE rp.user_id = $1
		ORDER BY r.created_at DESC
	`

	err := r.db.SelectContext(ctx, &rooms, query, userId)
	if err != nil {
		return nil, fmt.Errorf("get user rooms: %w", err)
	}

	return rooms, nil
}

func (r *RoomRepository) AddParticipant(ctx context.Context, roomId, userId string) error {
	query := `
		INSERT INTO room_participants (room_id, user_id, joined_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (room_id, user_id) DO NOTHING
	`
	_, err := r.db.ExecContext(ctx, query, roomId, userId)
	if err != nil {
		log.Printf("AddParticipant error: %v", err)
		return fmt.Errorf("add participant: %w", err)
	}

	return nil
}

func (r *RoomRepository) RemoveParticipant(ctx context.Context, roomId, userId string) error {
	query := `DELETE FROM room_participants WHERE room_id = $1 AND user_id = $2`
	_, err := r.db.ExecContext(ctx, query, roomId, userId)
	if err != nil {
		return fmt.Errorf("remove participant: %w", err)
	}

	return nil
}

func (r *RoomRepository) GetParticipants(ctx context.Context, roomId string) ([]entity.User, error) {
	var participants []entity.User

	query := `
		SELECT u.id, u.username, u.code, u.avatar
		FROM users u
		JOIN room_participants rp ON u.id = rp.user_id
		WHERE rp.room_id = $1
		ORDER BY u.username
	`
	err := r.db.SelectContext(ctx, &participants, query, roomId)
	if err != nil {
		return nil, fmt.Errorf("get room participants: %w", err)
	}

	return participants, nil
}

func (r *RoomRepository) UpdateAdmin(ctx context.Context, roomId, newAdminId string) error {
	query := `UPDATE rooms SET admin_id = $1 WHERE id = $2`

	result, err := r.db.ExecContext(ctx, query, newAdminId, roomId)
	if err != nil {
		return fmt.Errorf("update admin: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *RoomRepository) DeleteRoom(ctx context.Context, id string) error {
	query := `DELETE FROM rooms WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete room: %w", err)
	}

	return nil
}
