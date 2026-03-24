package websocket

type Hub struct {
	Rooms      map[string]map[*Client]bool
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *BroadcastMessage
}

type BroadcastMessage struct {
	RoomId  string
	Message []byte
}

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *BroadcastMessage),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			clients := h.Rooms[client.RoomId]
			if clients == nil {
				clients = make(map[*Client]bool)
				h.Rooms[client.RoomId] = clients
			}
			clients[client] = true
		case client := <-h.Unregister:
			if clients, ok := h.Rooms[client.RoomId]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.Rooms, client.RoomId)
					}
				}
			}
		case msg := <-h.Broadcast:
			if clients, ok := h.Rooms[msg.RoomId]; ok {
				for client := range clients {
					select {
					case client.Send <- msg.Message:
					default:
						close(client.Send)
						delete(clients, client)
						if len(clients) == 0 {
							delete(h.Rooms, msg.RoomId)
						}
					}
				}
			}
		}
	}
}
