package friend

//SendFriendRequest - формат запроса для отправки заявки в друзья
type SendFriendRequest struct {
	Username string `json:"username"`
	Code     string `json:"code"`
}

//FriendResponse - формат ответа для получения списка друзей
type FriendResponse struct {
	Id       string  `json:"id"`
	Username string  `json:"username"`
	Code     string  `json:"code"`
	Avatar   *string `json:"avatar,omitempty"`
}
