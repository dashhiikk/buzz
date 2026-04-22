package repositories

import (
	"Buzz/internal/entity"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type RefreshRepository struct {
	db *sqlx.DB
}

func NewRefreshRepository(db *sqlx.DB) *RefreshRepository {
	return &RefreshRepository{db: db}
}

func (r *RefreshRepository) Store(ctx context.Context, userId, tokenHash string, expiresAt time.Time) error {
	query := `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`
	_, err := r.db.ExecContext(ctx, query, userId, tokenHash, expiresAt)
	if err != nil {
		return fmt.Errorf("store refresh token: %v", err)
	}

	return nil
}

func (r *RefreshRepository) GetByTokenHash(ctx context.Context, tokenHash string) (*entity.RefreshToken, error) {
	query := `
		SELECT id, user_id, token_hash, expires_at, revoked, created_at 
		FROM refresh_tokens 
		WHERE token_hash = $1
	`
	var token entity.RefreshToken
	if err := r.db.GetContext(ctx, &token, query, tokenHash); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &token, nil
}

func (r *RefreshRepository) Revoke(ctx context.Context, tokenId string) error {
	query := `UPDATE refresh_tokens SET revoked = true WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, tokenId)
	if err != nil {
		return fmt.Errorf("revoke refresh token: %v", err)
	}
	return nil
}

func (r *RefreshRepository) RevokeAllForUser(ctx context.Context, userId string) error {
	query := `UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`

	_, err := r.db.ExecContext(ctx, query, userId)
	if err != nil {
		return fmt.Errorf("revoke all for user: %v", err)
	}
	return nil
}
