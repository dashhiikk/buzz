package entity

import "time"

type User struct {
	Id           string     `db:"id" json:"id"`
	Username     string     `db:"username" ison:"username"`
	Code         string     `db:"code" json:"code"`
	Email        string     `db:"email" json:"-"`
	PasswordHash string     `db:"password_hash" json:"-"`
	Avatar       *string    `db:"avatar" json:"avatar,omitempty"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	IsVerified   bool       `db:"is_verified" json:"isVerified"`
	Phone        *string    `db:"phone" json:"phone,omitempty"`
	FirstName    *string    `db:"first_name" json:"firstName,omitempty"`
	BirthDate    *time.Time `db:"birth_date" json:"birthDate,omitempty"`
}
