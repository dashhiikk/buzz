package validator

import (
	"unicode"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
	registerCustomValidations()
}

func registerCustomValidations() {
	validate.RegisterValidation("password", func(fl validator.FieldLevel) bool {
		password := fl.Field().String()
		return isValidPassword(password)
	})

	validate.RegisterValidation("code", func(fl validator.FieldLevel) bool {
		code := fl.Field().String()
		return isValidCode(code)
	})

	validate.RegisterValidation("username", func(fl validator.FieldLevel) bool {
		username := fl.Field().String()
		return isValidUsername(username)
	})
}

func isValidPassword(password string) bool {
	if len(password) < 8 {
		return false
	}

	hasLetter := false
	hasDigit := false
	for _, ch := range password {
		if unicode.IsLetter(ch) {
			hasLetter = true
		}
		if unicode.IsDigit(ch) {
			hasDigit = true
		}
		if hasLetter && hasDigit {
			return true
		}
	}

	return hasLetter && hasDigit
}

func isValidCode(code string) bool {
	if len(code) != 4 {
		return false
	}

	for _, ch := range code {
		if ch < '0' || ch > '9' {
			return false
		}
	}

	return true
}

func isValidUsername(username string) bool {
	if len(username) == 0 || len(username) > 32 {
		return false
	}

	for _, ch := range username {
		if !unicode.IsLetter(ch) && !unicode.IsDigit(ch) && ch != '_' && ch != '.' {
			return false
		}
	}

	return true
}

func ValidateStruct(s interface{}) error {
	return validate.Struct(s)
}

func Var(field interface{}, tag string) error {
	return validate.Var(field, tag)
}
