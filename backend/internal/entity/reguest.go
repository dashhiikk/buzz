package entity

import "time"

type Request struct {
	Id         string    `db:"id" json:"id"`
	SenderId   string    `db:"sender_id" json:"senderId"`
	ReceiverId string    `db:"receiver_id" json:"receiverId"`
	Purpose    string    `db:"purpose" json:"purpose"`
	Status     string    `db:"status" json:"status"`
	RoomId     *string   `db:"room_id" json:"roomId,omitempty"`
	CreatedAt  time.Time `db:"created_at" json:"createdAt"`
}
