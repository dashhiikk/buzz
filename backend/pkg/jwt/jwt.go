package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrTokenExpired     = errors.New("token expired")
	ErrTokenInvalid     = errors.New("token invalid")
	ErrSignatureInvalid = errors.New("signature invalid")
)

type Service interface {
	Generate(userId string) (string, error)
	GenerateWithExpiry(userID string, expiry time.Duration) (string, error)
	Validate(tokenStr string) (*Claims, error)
}

type Claims struct {
	UserId string `json:"user_id"`
	jwt.RegisteredClaims
}

type JWTService struct {
	secretKey    []byte
	accessExpire time.Duration
}

func NewJWTService(secretKey string, accessExpire time.Duration) *JWTService {
	return &JWTService{
		secretKey:    []byte(secretKey),
		accessExpire: accessExpire,
	}
}

func (s *JWTService) Generate(userId string) (string, error) {
	expireTime := time.Now().Add(s.accessExpire)

	claims := &Claims{
		UserId: userId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expireTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "buzz",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(s.secretKey)
}

func (s *JWTService) GenerateWithExpiry(userId string, expiry time.Duration) (string, error) {
	expireTime := time.Now().Add(expiry)
	claims := &Claims{
		UserId: userId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expireTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "buzz",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(s.secretKey)
}

func (s *JWTService) Validate(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return s.secretKey, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		if errors.Is(err, jwt.ErrSignatureInvalid) {
			return nil, ErrSignatureInvalid
		}
		return nil, ErrTokenInvalid
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrTokenInvalidClaims
}
