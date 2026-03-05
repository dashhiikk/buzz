package repositories

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"

	"Buzz/internal/entity"
)

type userRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *userRepository {
	return &userRepository{db: db}
}

func (r *userRepository) CreateUser(ctx context.Context, user *entity.User, passwordHash string) error {
	query := `
		INSERT INTO users (id, username, code, email, password_hash, avatar, created_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
		RETURNING id, created_at
	`

	row := r.db.QueryRowContext(ctx, query, user.Username, user.Code, user.Email, passwordHash, user.Avatar)
	err := row.Scan(&user.Id, &user.CreatedAt)
	if err != nil {
		return err
	}

	return nil
}

func (r *userRepository) GetUserByUsernameAndCode(ctx context.Context, username, code string) (*entity.User, error) {
	var user entity.User

	query := `
		SELECT id, username, code, email, password_hash, avatar, created_at
		FROM users
		WHERE username = $1 AND code = $2
	`

	err := r.db.GetContext(ctx, &user, query, username, code)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) GetUserByEmail(ctx context.Context, email string) (*entity.User, error) {
	var user entity.User

	query := `
		SELECT id, username, code, email, password_hash, avatar, created_at
		FROM users
		WHERE email = $1
	`

	err := r.db.GetContext(ctx, &user, query, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) UpdatePassword(ctx context.Context, userID, newPasswordHash string) error {
	query := `UPDATE users SET password_hash = $1 WHERE id = $2`

	result, err := r.db.ExecContext(ctx, query, newPasswordHash, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
