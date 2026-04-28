package jitsi

// GetTokenResponse — структура ответа для получения токена Jitsi.
type GetTokenResponse struct {
	Token     string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` // JWT для доступа к Jitsi
	ServerUrl string `json:"serverUrl" example:"https://jitsi.example.ru"`            // URL Jitsi-сервера
}
