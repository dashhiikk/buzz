package websocket

type NotificationHub struct {
	Clients    map[string]map[*Client]bool
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
		Clients:    make(map[string]map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Notification),
	}
}

func (h *NotificationHub) Run() {
	for {
		select {
		case client := <-h.Register:
			clients := h.Clients[client.UserId]
			if clients == nil {
				clients = make(map[*Client]bool)
				h.Clients[client.UserId] = clients
			}
			clients[client] = true
		case client := <-h.Unregister:
			if clients, ok := h.Clients[client.UserId]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.Clients, client.UserId)
					}
				}
			}
		case notif := <-h.Broadcast:
			if clients, ok := h.Clients[notif.UserId]; ok {
				for client := range clients {
					select {
					case client.Send <- notif.Payload:
					default:
						close(client.Send)
						delete(clients, client)
						if len(clients) == 0 {
							delete(h.Clients, notif.UserId)
						}
					}
				}
			}
		}
	}
}

func (h *NotificationHub) SendToUser(userId string, payload []byte) {
	h.Broadcast <- &Notification{
		UserId:  userId,
		Payload: payload,
	}
}
