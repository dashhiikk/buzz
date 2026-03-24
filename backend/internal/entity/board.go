package entity

import (
	"encoding/json"
	"time"
)

type BoardState struct {
	RoomId    string          `db:"room_id" json:"roomId"`
	Content   json.RawMessage `db:"content" json:"content"`
	UpdatedAt time.Time       `db:"updated_at" json:"updatedAt"`
}
