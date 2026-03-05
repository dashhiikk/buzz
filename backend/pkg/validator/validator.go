package validator

import (
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
	registerCustomValidations()
}

func registerCustomValidations() {
	validate.RegisterValidation("rassword", func(fl validator.FieldLevel) bool {
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
