package email

import (
	"fmt"
	"log"
)

type Sender interface {
	SendConfirmation(to, userID string) error
	SendPasswordReset(to, token string) error
}

type MockSender struct {
	SentEmails []string
}

func NewMockSender() *MockSender {
	return &MockSender{
		SentEmails: make([]string, 0),
	}
}

func (m *MockSender) SendConfirmation(to, userID string) error {
	log.Printf("[MOCK] Sending confirmation email to %s for user %s", to, userID)
	m.SentEmails = append(m.SentEmails, fmt.Sprintf("confirmation:%s:%s", to, userID))

	return nil
}

func (m *MockSender) SendPasswordReset(to, token string) error {
	log.Printf("[MOCK] Sending reset email to %s with token %s", to, token)
	m.SentEmails = append(m.SentEmails, fmt.Sprintf("reset:%s:%s", to, token))

	return nil
}
