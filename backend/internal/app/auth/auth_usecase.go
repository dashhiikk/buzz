package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"Buzz/internal/domain/auth"
	"Buzz/internal/entity"
	"Buzz/internal/infra/email"
	"Buzz/pkg/code"
	"Buzz/pkg/hash"
	"Buzz/pkg/jwt"
	"Buzz/pkg/validator"
)

var (
	ErrUserExists      = errors.New("Пользователь уже существует")
	ErrUserNotFound    = errors.New("Пользователь не найден")
	ErrInvalidPassword = errors.New("Неверный пароль")

	ErrInvalidUsername  = errors.New("Имя пользователя должно быть от 1 до 32 символов и может содержать буквы, цифры, точку и подчёркивание")
	ErrInvalidEmail     = errors.New("Некорректный email")
	ErrWeakPassword     = errors.New("Пароль должен быть длиной не менее 8 символов и содержать буквы и цифры")
	ErrInvalidCode      = errors.New("Код должен состоять ровно из 4 цифр")
	ErrInvalidPhone     = errors.New("Телефон должен быть в формате +7 000 000 00 00")
	ErrInvalidBirthDate = errors.New("Некорректная дата рождения")
	ErrInvalidFirstName = errors.New("Имя может содержать только буквы")

	ErrTokenInvalid  = errors.New("Неверный токен")
	ErrTokenExpired  = errors.New("Токен истек")
	ErrUserNotVerify = errors.New("Email не подврержден")
)

type AuthUseCase struct {
	userRepo    auth.AuthRepository
	hasher      hash.PasswordHasher
	jwtService  jwt.Service
	emailSender email.Sender
}

func NewAuthUseCase(
	userRepo auth.AuthRepository,
	hasher hash.PasswordHasher,
	jwtService jwt.Service,
	emailSender email.Sender,
) *AuthUseCase {
	return &AuthUseCase{
		userRepo:    userRepo,
		hasher:      hasher,
		jwtService:  jwtService,
		emailSender: emailSender,
	}
}

func (uc *AuthUseCase) Register(ctx context.Context, username, email, password string) error {
	const defaultAvatarPath = "/uploads/default-user-avatar.jpg"

	if err := validator.Var(username, "required,username"); err != nil {
		return ErrInvalidUsername
	}
	if err := validator.Var(email, "required,email"); err != nil {
		return ErrInvalidEmail
	}
	if err := validator.Var(password, "required,password"); err != nil {
		return ErrWeakPassword
	}

	existingUser, err := uc.userRepo.GetUserByEmail(ctx, email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return err
	}
	if existingUser != nil {
		return ErrUserExists
	}

	checkCode := func(ctx context.Context, c string) (bool, error) {
		_, err := uc.userRepo.GetUserByUsernameAndCode(ctx, username, c)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return true, nil
			}
			return false, err
		}
		return false, nil
	}

	codeStr, err := code.GenerateCode(ctx, checkCode, 100)
	if err != nil {
		return fmt.Errorf("generate code: %w", err)
	}

	passwordHash, err := uc.hasher.Hash(password)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	defaultAvatar := defaultAvatarPath
	user := &entity.User{
		Username: username,
		Code:     codeStr,
		Email:    email,
		Avatar:   &defaultAvatar,
	}

	if err := uc.userRepo.CreateUser(ctx, user, passwordHash); err != nil {
		return err
	}

	token, err := uc.jwtService.GenerateWithExpiry(user.Id, 24*time.Hour)
	if err != nil {
		log.Printf("failed to generate verification token: %v", err)
	} else {
		if err := uc.emailSender.SendVerification(user.Email, token); err != nil {
			log.Printf("failed to send verification email: %v", err)
		}
	}

	return nil
}

func (uc *AuthUseCase) CancelRegister(ctx context.Context, userEmail string) error {
	if err := uc.userRepo.DeleteUserByEmail(ctx, userEmail); err != nil {
		return err
	}
	return nil
}

func (uc *AuthUseCase) VerifyEmailAndLogin(ctx context.Context, token string) (string, error) {
	claims, err := uc.jwtService.Validate(token)
	if err != nil {
		return "", ErrTokenInvalid
	}

	if err := uc.userRepo.UpdateVerifiedStatus(ctx, claims.UserId, true); err != nil {
		return "", err
	}

	authToken, err := uc.jwtService.Generate(claims.UserId)
	if err != nil {
		return "", fmt.Errorf("generate token: %w", err)
	}

	return authToken, nil
}

func (uc *AuthUseCase) Login(ctx context.Context, email, password string) (string, error) {
	if err := validator.Var(email, "required,email"); err != nil {
		return "", ErrInvalidUsername
	}

	user, err := uc.userRepo.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", ErrUserNotFound
		}
		return "", err
	}

	if err := uc.hasher.Check(password, user.PasswordHash); err != nil {
		return "", ErrInvalidPassword
	}
	log.Printf("isverified: %t", user.IsVerified)
	if !user.IsVerified {
		return "", ErrUserNotVerify
	}

	token, err := uc.jwtService.Generate(user.Id)
	if err != nil {
		return "", fmt.Errorf("generate token: %w", err)
	}

	return token, nil
}

func (uc *AuthUseCase) RequestPasswordReset(ctx context.Context, email string) error {
	if err := validator.Var(email, "required,email"); err != nil {
		return ErrInvalidEmail
	}

	user, err := uc.userRepo.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		return err
	}

	token, err := uc.jwtService.GenerateWithExpiry(user.Id, 15*time.Minute)
	if err != nil {
		return fmt.Errorf("generate reset token: %w", err)
	}

	if err := uc.emailSender.SendPasswordReset(email, token); err != nil {
		return fmt.Errorf("send reset email: %w", err)
	}

	return nil
}

func (uc *AuthUseCase) UpdatePasswordAndVerify(ctx context.Context, token, newPassword string) (string, error) {
	if err := validator.Var(newPassword, "required,password"); err != nil {
		return "", ErrWeakPassword
	}

	claims, err := uc.jwtService.Validate(token)
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return "", ErrTokenExpired
		}
		return "", ErrTokenInvalid
	}

	passwordHash, err := uc.hasher.Hash(newPassword)
	if err != nil {
		return "", fmt.Errorf("hash password: %w", err)
	}

	err = uc.userRepo.UpdatePassword(ctx, claims.UserId, passwordHash)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", ErrUserNotFound
		}
		return "", err
	}

	authToken, err := uc.jwtService.Generate(claims.UserId)
	if err != nil {
		return "", fmt.Errorf("generate token: %w", err)
	}

	return authToken, nil
}

func (uc *AuthUseCase) ResendVerificationEmail(ctx context.Context, email string) error {
	user, err := uc.userRepo.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		return ErrUserNotFound
	}
	if user.IsVerified {
		return nil
	}
	token, err := uc.jwtService.GenerateWithExpiry(user.Id, 24*time.Hour)
	if err != nil {
		return fmt.Errorf("generate token: %w", err)
	}
	if err := uc.emailSender.SendVerification(user.Email, token); err != nil {
		return fmt.Errorf("send email: %w", err)
	}
	return nil
}

func (uc *AuthUseCase) GetMeById(ctx context.Context, id string) (*entity.User, error) {
	user, err := uc.userRepo.GetUserById(ctx, id)
	if err != nil {
		log.Printf("getma error: %v", err)
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, ErrUserNotFound
	}

	return user, nil
}

type ValidationErrors map[string]string

func (uc *AuthUseCase) UpdateProfile(ctx context.Context, userID string, updates map[string]interface{}) (ValidationErrors, error) {
	user, err := uc.userRepo.GetUserById(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	oldUsername := user.Username
	oldCode := user.Code

	errs := make(ValidationErrors)
	if username, ok := updates["username"]; ok && username != nil {
		if err := validator.Var(username, "username"); err != nil {
			errs["username"] = ErrInvalidUsername.Error()
		} else {
			user.Username = username.(string)
		}
	}
	if code, ok := updates["code"]; ok && code != nil {
		if err := validator.Var(code, "code"); err != nil {
			errs["code"] = ErrInvalidCode.Error()
		} else {
			user.Code = code.(string)
		}
	}
	if email, ok := updates["email"]; ok && email != nil {
		if err := validator.Var(email, "email"); err != nil {
			errs["email"] = ErrInvalidEmail.Error()
		} else {
			user.Email = email.(string)
		}
	}
	if phone, ok := updates["phone"]; ok && phone != nil {
		if err := validator.Var(*phone.(*string), "phone"); err != nil {
			errs["phone"] = ErrInvalidPhone.Error()
		} else {
			user.Phone = phone.(*string)
		}
	}
	if firstName, ok := updates["firstName"]; ok && firstName != nil {
		if err := validator.Var(*firstName.(*string), "name"); err != nil {
			errs["firstName"] = ErrInvalidFirstName.Error()
		} else {
			user.FirstName = firstName.(*string)
		}
	}
	if birthDate, ok := updates["birthDate"]; ok && birthDate != nil {
		if err := validator.Var(birthDate, "birthdate"); err != nil {
			errs["birthDate"] = ErrInvalidBirthDate.Error()
		} else {
			if bd, ok := birthDate.(string); ok {
				parsed, _ := time.Parse("2006-01-02", bd)
				user.BirthDate = &parsed
			} else if bd, ok := birthDate.(*time.Time); ok {
				user.BirthDate = bd
			}
		}
	}
	if avatar, ok := updates["avatar"]; ok && avatar != nil {
		user.Avatar = avatar.(*string)
	}

	if user.Username != oldUsername || user.Code != oldCode {
		exists, err := uc.userRepo.CheckUserExistsByUsernameAndCode(ctx, user.Username, user.Code, userID)
		if err != nil {
			return nil, fmt.Errorf("check uniqueness: %w", err)
		}
		if exists {
			errs["usernameCode"] = ErrUserExists.Error()
		}
	}

	if len(errs) > 0 {
		return errs, nil
	}

	if err := uc.userRepo.UpdateUser(ctx, user); err != nil {
		return nil, err
	}
	return nil, nil
}

func (uc *AuthUseCase) ChangePassword(ctx context.Context, userID, oldPassword, newPassword string) error {
	user, err := uc.userRepo.GetUserById(ctx, userID)
	if err != nil {
		return ErrUserNotFound
	}

	if err := validator.Var(newPassword, "required,password"); err != nil {
		return ErrWeakPassword
	}

	if err := uc.hasher.Check(oldPassword, user.PasswordHash); err != nil {
		return ErrInvalidPassword
	}

	newHash, err := uc.hasher.Hash(newPassword)
	if err != nil {
		return fmt.Errorf("hash new password: %w", err)
	}

	if err := uc.userRepo.UpdatePassword(ctx, userID, newHash); err != nil {
		return err
	}
	return nil
}
