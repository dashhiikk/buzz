package hash

import "testing"

func TestHashPassword(t *testing.T) {
	password := "secretpassword"

	hasher := NewBcryptHasher()

	hash, err := hasher.Hash(password)
	if err != nil {
		t.Fatalf("HashPassword returned err: %v", err)
	}
	if hash == "" {
		t.Fatal("HashPassword returned void hash")
	}

	err = hasher.Check(password, hash)
	if err != nil {
		t.Fatalf("CheckPasswordHash не прошла для правильного пароля: %v", err)
	}

	wrongPassword := "wrongpassword"
	err = hasher.Check(wrongPassword, hash)
	if err == nil {
		t.Fatal("CheckPasswordHash прошла для неправильного пароля")
	}
}
