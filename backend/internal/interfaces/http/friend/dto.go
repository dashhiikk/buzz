package friend

import "time"

type SendFriendRequest struct {
	Username string `json:"username"`
	Code     string `json:"code"`
}

type IncomingRequest struct {
	Id        string    `json:"id"`
	Username  string    `json:"username"`
	Code      string    `json:"code"`
	Avatar    *string   `json:"avatar,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

type Friend struct {
	Id       string  `json:"id"`
	Username string  `json:"username"`
	Code     string  `json:"code"`
	Avatar   *string `json:"avatar,omitempty"`
}
