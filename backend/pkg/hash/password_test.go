package hash

import "testing"

func TestHashPassword(t *testing.T) {
	password := "secretpassword"

	hasher := NewHasher()

	hash, err := hasher.HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword returned err: %v", err)
	}
	if hash == "" {
		t.Fatal("HashPassword returned void hash")
	}

	err = hasher.CheckPasswordHash(password, hash)
	if err != nil {
		t.Fatalf("CheckPasswordHash не прошла для правильного пароля: %v", err)
	}

	wrongPassword := "wrongpassword"
	err = hasher.CheckPasswordHash(wrongPassword, hash)
	if err == nil {
		t.Fatal("CheckPasswordHash прошла для неправильного пароля")
	}
}
