package entity

import "time"

type MessageFile struct {
	Url          string `json:"url"`
	OriginalName string `json:"originalName"`
}

type Message struct {
	Id        string        `db:"id" json:"id"`
	RoomId    string        `db:"room_id" json:"roomId"`
	SenderId  string        `db:"sender_id" json:"senderId"`
	Text      string        `db:"text" json:"text"`
	Files     []MessageFile `db:"files" json:"files,omitempty"`
	CreatedAt time.Time     `db:"created_at" json:"createdAt"`
}

type MessageForHistory struct {
	Message
	SenderUsername string  `json:"senderUsername"`
	SenderAvatar   *string `json:"senderAvatar"`
}
