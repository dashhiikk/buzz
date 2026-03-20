package entity

import "time"

type Message struct {
	Id        string    `db:"id" json:"id"`
	RoomId    string    `db:"id" json:"roomId"`
	SenderId  string    `db:"sender_id" json:"senderId"`
	Text      string    `db:"text" json:"text"`
	Files     []string  `db:"files" json:"files,omitempty"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}
