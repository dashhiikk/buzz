package random

import (
	"context"
	"testing"
)

func TestGenerateCode(t *testing.T) {
	ctx := context.Background()

	mockCheck := func(ctx context.Context, code string) (bool, error) {
		if len(code) != 4 {
			t.Errorf("code length is %d, expected 4", len(code))
		}

		for _, ch := range code {
			if ch < '0' || ch > '9' {
				t.Errorf("code contains non-digit character: %c", ch)
			}
		}

		return true, nil
	}

	code, err := GenerateCode(ctx, mockCheck, 500)
	if err != nil {
		t.Fatalf("Faled GenerateCode with error: %v", err)
	}
	t.Logf("Sucsesful generation, code: %s", code)
}
