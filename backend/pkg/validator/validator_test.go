package validator

import "testing"

func TestValiadationProccess(t *testing.T) {
	type testUser struct {
		Username string `validate:"required,username"`
		Email    string `validate:"required,email"`
		Password string `validate:"required,password"`
		Code     string `validate:"required,code"`
	}

	tests := []struct {
		name       string
		user       testUser
		wantErr    bool
		wantErrors int
	}{
		{
			name: "valid user",
			user: testUser{
				Username: "alex",
				Email:    "alex5555@gmail.com",
				Password: "lalalalalalal10_.",
				Code:     "0000",
			},
			wantErr:    false,
			wantErrors: 0,
		},
		{
			name: "invalid user",
			user: testUser{
				Username: "",
				Email:    "alex55",
				Password: "1",
				Code:     "00a0",
			},
			wantErr:    true,
			wantErrors: 4,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateStruct(tt.user)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateStruct() error = %v, wantErr %v", err, tt.wantErr)
			}
			if err != nil {
				errors := FormatValidationErrors(err)
				if len(errors) != tt.wantErrors {
					t.Errorf("FormatValidationErrors() returned %d errors, want %d", len(errors), tt.wantErrors)
				}
			}
		})
	}
}
