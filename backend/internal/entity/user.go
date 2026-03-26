package entity

import "time"

type User struct {
	Id           string    `db:"id" json:"id"`
	Username     string    `db:"username" ison:"username"`
	Code         string    `db:"code" json:"code"`
	Email        string    `db:"email" json:"-"`
	PasswordHash string    `db:"password_hash" json:"-"`
	Avatar       *string   `db:"avatar" json:"avatar,omitempty"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	IsVerified   bool      `db:"is_verified" json:"isVerified"`
}
