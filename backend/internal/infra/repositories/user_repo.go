package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

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
		return fmt.Errorf("create user: %w", err)
	}

	return nil
}

func (r *userRepository) GetUserById(ctx context.Context, id string) (*entity.User, error) {
	var user entity.User

	query := `
		SELECT id, username, code, email, password_hash, avatar, created_at, is_verified, phone, first_name, birth_date
		FROM users
		WHERE id = $1
	`
	err := r.db.GetContext(ctx, &user, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("get user by id: %w", err)
	}

	return &user, nil
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
		return nil, fmt.Errorf("get user by username and code: %w", err)
	}

	return &user, nil
}

func (r *userRepository) GetUserByEmail(ctx context.Context, email string) (*entity.User, error) {
	var user entity.User

	query := `
		SELECT id, username, code, email, password_hash, avatar, created_at, is_verified
		FROM users
		WHERE email = $1
	`

	err := r.db.GetContext(ctx, &user, query, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, fmt.Errorf("get user by email: %w", err)
	}

	return &user, nil
}

func (r *userRepository) UpdatePassword(ctx context.Context, userID, newPasswordHash string) error {
	query := `UPDATE users SET password_hash = $1 WHERE id = $2`

	result, err := r.db.ExecContext(ctx, query, newPasswordHash, userID)
	if err != nil {
		return fmt.Errorf("update password: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("update password: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *userRepository) UpdateVerifiedStatus(ctx context.Context, userId string, verified bool) error {
	query := `UPDATE users SET is_verified = $1 WHERE id= $2`
	_, err := r.db.ExecContext(ctx, query, verified, userId)
	return err
}

func (r *userRepository) DeleteUserByEmail(ctx context.Context, email string) error {
	query := `DELETE FROM users WHERE email = $1`
	_, err := r.db.ExecContext(ctx, query, email)
	if err != nil {
		return fmt.Errorf("remove user: %w", err)
	}

	return nil
}

func (r *userRepository) UpdateUser(ctx context.Context, user *entity.User) error {
	query := `
        UPDATE users SET
            username = $1,
            email = $2,
            phone = $3,
            first_name = $4,
            birth_date = $5,
            avatar = $6
        WHERE id = $7
    `
	_, err := r.db.ExecContext(ctx, query,
		user.Username, user.Email, user.Phone, user.FirstName, user.BirthDate, user.Avatar, user.Id)
	if err != nil {
		return fmt.Errorf("update user: %w", err)
	}
	return nil
}

func (r *userRepository) CheckUserExistsByUsernameAndCode(ctx context.Context, username, code, excludeUserID string) (bool, error) {
	var exists bool
	query := `
        SELECT EXISTS(
            SELECT 1 FROM users
            WHERE username = $1 AND code = $2 AND id != $3
        )
    `
	err := r.db.QueryRowContext(ctx, query, username, code, excludeUserID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check user exists: %w", err)
	}
	return exists, nil
}
