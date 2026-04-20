package entity

import "time"

type RefreshToken struct {
	Id        string    `db:"id" json:"id"`
	UserId    string    `db:"user_id" json:"userId"`
	TokenHash string    `db:"token_hash" json:"tokenHash"`
	ExpiresAt time.Time `db:"expires_at" json:"expiresAt"`
	Revoked   bool      `db:"revoked" json:"revoked"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}
