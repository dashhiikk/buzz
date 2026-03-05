package email

import "testing"

func TestSender(t *testing.T) {
	sender := NewMockSender()

	err := sender.SendConfirmation("user", "user id")
	if err != nil {
		t.Errorf("SendConfirmation failed: %v", err)
	}

	sender.SendPasswordReset("user", "is token")
	if err != nil {
		t.Errorf("SendPasswordReset failed: %v", err)
	}

	if len(sender.SentEmails) != 2 {
		t.Errorf("expected 2 sent emails, got %d", len(sender.SentEmails))
	}
}
