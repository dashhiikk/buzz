package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func FormatValidationErrors(err error) []ValidationError {
	var errors []ValidationError

	if validationErrs, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrs {
			field := e.Field()
			message := getErrorMessage(e)
			errors = append(errors, ValidationError{
				Field:   field,
				Message: message,
			})
		}
	}

	return errors
}

func getErrorMessage(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return "Поле обязательно для заполнения"
	case "email":
		return "Некорректный email"
	case "password":
		return "Пароль должен быть не менее 8 символов и содержать буквы и цифры"
	case "username":
		return "Имя пользователя должно быть от 1 до 32 символов и может содержать буквы, цифры, точку и подчёркивание"
	case "code":
		return "Код должен состоять ровно из 4 цифр"
	case "min":
		return "Слишком короткое значение"
	case "max":
		return "Слишком длинное значение"
	default:
		if e.Param() != "" {
			return fmt.Sprintf("Ошибка валидации: %s=%s", e.Tag(), e.Param())
		}
		return fmt.Sprintf("Ошибка валидации: %s", e.Tag())
	}
}
