package room

import "time"

// CreateRoomRequest — тело запроса для создания комнаты
type CreateRoomRequest struct {
	Name string  `json:"name"`
	Icon *string `json:"icon,omitempty"`
}

// SendRoomInviteRequest — тело запроса для отправки приглашения
type SendRoomInviteRequest struct {
	Username string `json:"username"`
	Code     string `json:"code"`
}

// RoomResponse — структура ответа с информацией о комнате
type RoomResponse struct {
	Id        string    `json:"id"`
	Name      string    `json:"name"`
	Icon      *string   `json:"icon,omitempty"`
	AdminId   string    `json:"adminId"`
	CreatedAt time.Time `json:"createdAt"`
}

// ParticipantResponse — информация об участнике
type ParticipantResponse struct {
	Id       string  `json:"id"`
	Username string  `json:"username"`
	Code     string  `json:"code"`
	Avatar   *string `json:"avatar,omitempty"`
}

// AppointAdminRequest — тело запроса для назначения администратора
type AppointAdminRequest struct {
	NewAdminID string `json:"newAdminId"`
}
