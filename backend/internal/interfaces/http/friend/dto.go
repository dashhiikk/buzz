package friend

type SendFriendRequest struct {
	Username string `json:"username"`
	Code     string `json:"code"`
}

type FriendResponse struct {
	Id       string  `json:"id"`
	Username string  `json:"username"`
	Code     string  `json:"code"`
	Avatar   *string `json:"avatar,omitempty"`
}
