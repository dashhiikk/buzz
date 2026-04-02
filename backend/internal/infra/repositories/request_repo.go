package repositories

import (
	"Buzz/internal/entity"
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type RequestRepository struct {
	db *sqlx.DB
}

func NewRequestRepository(db *sqlx.DB) *RequestRepository {
	return &RequestRepository{db: db}
}

func (r *RequestRepository) CreateRequest(ctx context.Context, req *entity.Request) error {
	query := `
		INSERT INTO requests (id, sender_id, receiver_id, purpose, status, room_id, created_at)
		VALUES (gen_random_uuid(), $1, $2, $3, 'pending', $4, NOW())
		RETURNING id, created_at
	`
	row := r.db.QueryRowContext(ctx, query, req.SenderId, req.ReceiverId, req.Purpose, req.RoomId)

	err := row.Scan(&req.Id, &req.CreatedAt)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	return nil
}

func (r *RequestRepository) GetRequestById(ctx context.Context, id string) (*entity.Request, error) {
	var req entity.Request

	query := `
		SELECT id, sender_id, receiver_id, purpose, status, room_id, created_at
		FROM requests
		WHERE id = $1
	`
	err := r.db.GetContext(ctx, &req, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("get request by id: %w", err)
	}

	return &req, nil
}

func (r *RequestRepository) GetIncoming(ctx context.Context, userId, status string) ([]entity.Request, error) {
	var requests []entity.Request

	query := `
		SELECT id, sender_id, receiver_id, purpose, status, room_id, created_at
		FROM requests
		WHERE receiver_id = $1 AND status = $2
		ORDER BY created_at DESC
	`

	err := r.db.SelectContext(ctx, &requests, query, userId, status)
	if err != nil {
		return nil, fmt.Errorf("get incoming request: %w", err)
	}

	return requests, nil
}

func (r *RequestRepository) GetOutgoing(ctx context.Context, userId string) ([]entity.Request, error) {
	var requests []entity.Request

	query := `
		SELECT id, sender_id, receiver_id, purpose, status, room_id, created_at
		FROM requests
		WHERE sender_id = $1
		ORDER BY created_at DESC
	`

	err := r.db.SelectContext(ctx, &requests, query, userId)
	if err != nil {
		return nil, fmt.Errorf("get outgoing request: %w", err)
	}

	return requests, nil
}

func (r *RequestRepository) UpdateStatus(ctx context.Context, id, status string) error {
	query := `UPDATE requests SET status = $1 WHERE id = $2`

	result, err := r.db.ExecContext(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("update request status: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("update request status: %w", err)
	}
	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *RequestRepository) DeleteRequest(ctx context.Context, id string) error {
	query := `DELETE FROM requests WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete request: %w", err)
	}

	return nil
}

func (r *RequestRepository) ExistsFriendPending(ctx context.Context, userId1, userId2, purpose string) (bool, error) {
	var exists bool

	query := `
		SELECT EXISTS (
			SELECT 1 FROM requests
			WHERE (
				(sender_id = $1 AND receiver_id = $2) OR
				(sender_id = $2 AND receiver_id = $1)
			)
			AND purpose = $3
			AND status = 'pending'
		)
	`
	row := r.db.QueryRowContext(ctx, query, userId1, userId2, purpose)
	err := row.Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check exists friend request: %w", err)
	}

	return exists, nil
}

func (r *RequestRepository) ExistsRoomPending(ctx context.Context, roomId, receiverId string) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS (
			SELECT 1 FROM requests
			WHERE room_id = $1 AND receiver_id = $2
			AND purpose = 'room' AND status = 'pending'
		)
	`
	err := r.db.QueryRowContext(ctx, query, roomId, receiverId).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check exists room request: %w", err)
	}

	return exists, nil
}

func (r *RequestRepository) GetAcceptedFriends(ctx context.Context, userId string) ([]entity.User, error) {
	query := `
		SELECT u.id, u.username, u.code, u.avatar
		FROM users u
		WHERE u.id IN (
			SELECT
				CASE
					WHEN r.sender_id = $1 THEN r.receiver_id
					ELSE r.sender_id
				END
			FROM requests r
			WHERE (r.sender_id = $1 OR r.receiver_id = $1)
			AND r.purpose = 'friend'
			AND r.status = 'accepted'
		) 
	`

	var friends []entity.User
	err := r.db.SelectContext(ctx, &friends, query, userId)
	if err != nil {
		return nil, fmt.Errorf("get accepted friends: %w", err)
	}

	return friends, nil
}

func (r *RequestRepository) DeleteFriendship(ctx context.Context, userId1, userId2 string) error {
	query := `
		DELETE FROM requests
		WHERE (
			(sender_id = $1 AND receiver_id = $2) OR
			(sender_id = $2 AND receiver_id = $1)
		)
		AND purpose = 'friend'
		AND status = 'accepted'
	`
	result, err := r.db.ExecContext(ctx, query, userId1, userId2)
	if err != nil {
		return fmt.Errorf("delete friendship: %w", err)
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}
