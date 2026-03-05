package jwt

import (
	"testing"
)

func TestJWTService(t *testing.T) {
	secret := "secret-key"
	expire := int64(3600)
	svc := NewJWTService(secret, expire)

	userID := "12345"
	token, err := svc.Generate(userID)
	if err != nil {
		t.Fatalf("Generate failed: %v", err)
	}
	if token == "" {
		t.Fatal("token is empty")
	}

	claims, err := svc.Validate(token)
	if err != nil {
		t.Fatalf("Validate error: %v", err)
	}
	if claims.UserId != userID {
		t.Errorf("expected UserId %s, got %s", userID, claims.UserId)
	}
}
