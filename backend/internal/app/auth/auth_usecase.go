package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"Buzz/internal/domain/auth"
	"Buzz/internal/entity"
	"Buzz/internal/infra/email"
	"Buzz/pkg/code"
	"Buzz/pkg/hash"
	"Buzz/pkg/jwt"
	"Buzz/pkg/validator"
)

var (
	ErrUserExists      = errors.New("user already exists")
	ErrUserNotFound    = errors.New("user not found")
	ErrInvalidPassword = errors.New("invalid password")
	ErrInvalidUsername = errors.New("invalid username")
	ErrInvalidEmail    = errors.New("invalid email")
	ErrWeakPassword    = errors.New("password does not meet security requirements")
	ErrInvalidCode     = errors.New("invalid code format")
	ErrTokenInvalid    = errors.New("token is invalid")
	ErrTokenExpired    = errors.New("token expired")
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

	user := &entity.User{
		Username: username,
		Code:     codeStr,
		Email:    email,
	}

	if err := uc.userRepo.CreateUser(ctx, user, passwordHash); err != nil {
		return err
	}

	if err := uc.emailSender.SendConfirmation(email, user.Id); err != nil {
		return fmt.Errorf("send confirmation email: %w", err)
	}

	return nil
}

func (uc *AuthUseCase) Login(ctx context.Context, username, code, password string) (string, error) {
	if err := validator.Var(username, "required,username"); err != nil {
		return "", ErrInvalidUsername
	}
	if err := validator.Var(code, "required,code"); err != nil {
		return "", ErrInvalidCode
	}
	if err := validator.Var(password, "required,password"); err != nil {
		return "", ErrWeakPassword
	}

	user, err := uc.userRepo.GetUserByUsernameAndCode(ctx, username, code)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", ErrUserNotFound
		}
		return "", err
	}

	if err := uc.hasher.Check(password, user.PasswordHash); err != nil {
		return "", ErrInvalidPassword
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

	token, err := uc.jwtService.Generate(user.Id)
	if err != nil {
		return fmt.Errorf("generate reset token: %w", err)
	}

	if err := uc.emailSender.SendPasswordReset(email, token); err != nil {
		return fmt.Errorf("send reset email: %w", err)
	}

	return nil
}

func (uc *AuthUseCase) ResetPassword(ctx context.Context, token, newPassword string) error {
	if err := validator.Var(newPassword, "required,password"); err != nil {
		return ErrWeakPassword
	}

	claims, err := uc.jwtService.Validate(token)
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return ErrTokenExpired
		}
		return ErrTokenInvalid
	}

	passwordHash, err := uc.hasher.Hash(newPassword)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	err = uc.userRepo.UpdatePassword(ctx, claims.UserId, passwordHash)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUserNotFound
		}
		return err
	}

	return nil
}
