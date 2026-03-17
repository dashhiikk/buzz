package room

import "time"

type CreateRoomRequest struct {
	Name string  `json:"name"`
	Icon *string `json:"icon,omitempty"`
}

type SendRoomInviteRequest struct {
	Username string `json:"username"`
	Code     string `json:"code"`
}

type RoomResponse struct {
	Id        string    `json:"id"`
	Name      string    `json:"name"`
	Icon      *string   `json:"icon,omitempty"`
	AdminId   string    `json:"adminId"`
	CreatedAt time.Time `json:"createdAt"`
}

type ParticipantResponse struct {
	Id       string  `json:"id"`
	Username string  `json:"username"`
	Code     string  `json:"code"`
	Avatar   *string `json:"avatar,omitempty"`
}

type AppointAdminRequest struct {
	NewAdminID string `json:"newAdminId"`
}
