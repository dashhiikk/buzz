package websocket

type NotificationHub struct {
	Clients    map[string]*Client
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *Notification
}

type Notification struct {
	UserId  string
	Payload []byte
}

func NewNotificationHub() *NotificationHub {
	return &NotificationHub{
		Clients:    make(map[string]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Notification),
	}
}

func (h *NotificationHub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client.UserId] = client
		case client := <-h.Unregister:
			if _, ok := (h.Clients[client.UserId]); !ok {
				delete(h.Clients, client.UserId)
				close(client.Send)
			}
		case notif := <-h.Broadcast:
			if client, ok := h.Clients[notif.UserId]; ok {
				select {
				case client.Send <- notif.Payload:
				default:
					close(client.Send)
					delete(h.Clients, notif.UserId)
				}
			}
		}
	}
}

func (h *NotificationHub) SendToUser(userId string, payload []byte) {
	h.Broadcast <- &Notification{UserId: userId, Payload: payload}
}
