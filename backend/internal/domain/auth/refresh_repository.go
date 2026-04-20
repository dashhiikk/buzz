package auth

import (
	"Buzz/internal/entity"
	"context"
	"time"
)

type RefreshRepository interface {
	Store(ctx context.Context, userId, tokenHash string, expitesAt time.Time) error
	GetByTokenHash(ctx context.Context, tokenHash string) (*entity.RefreshToken, error)
	Revoke(ctx context.Context, tokenId string) error
	RevokeAllForUser(ctx context.Context, userId string) error
}
