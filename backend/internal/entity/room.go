package entity

import "time"

type Room struct {
	Id          string    `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Icon        *string   `db:"icon" json:"icon,omitempty"`
	AdminId     string    `db:"admin_id" json:"adminIdd"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	IsPrivate   bool      `db:"is_private" json:"isPrivate"`
	InviteToken *string   `db:"invite_token" json:"inviteToken,omitempty"`
}
