package code

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
)

type CheckFunc func(ctx context.Context, code string) (bool, error)

func GenerateCode(ctx context.Context, check CheckFunc, maxAttempts int) (string, error) {
	if maxAttempts <= 0 {
		maxAttempts = 1000
	}

	for i := 0; i < maxAttempts; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(10000))
		if err != nil {
			return "", fmt.Errorf("failed to generate random number: %w", err)
		}

		codeInt := int(n.Int64())
		code := fmt.Sprintf("%04d", codeInt)

		ok, err := check(ctx, code)
		if err != nil {
			return "", fmt.Errorf("failed to check code uniqueness: %w", err)
		}
		if ok {
			return code, nil
		}
	}

	return "", fmt.Errorf("failed to generate unique code after %d attempts", maxAttempts)
}
