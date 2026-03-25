package board

import (
	"encoding/json"
	"time"
)

// BoardUpdate — структура изменения состояния доски.
type BoardUpdate struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// BoardStateResponse — структура ответа для состояния доски.
type BoardStateResponse struct {
	Content   json.RawMessage `json:"content"`   // произвольный JSON с состоянием доски
	UpdatedAt time.Time       `json:"updatedAt"` // время последнего обновления
}
