package jitsi

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JitsiJWT struct {
	secret []byte
	appId  string
	expire time.Duration
}

func NewJitsiJWT(secret, appId string, expire time.Duration) *JitsiJWT {
	return &JitsiJWT{
		secret: []byte(secret),
		appId:  appId,
		expire: expire,
	}
}

func (j *JitsiJWT) GenerateToken(roomId, userId string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"iss":  "chat",
		"sub":  userId,
		"room": roomId,
		"exp":  now.Add(j.expire).Unix(),
		"iat":  now.Unix(),
		"nbf":  now.Unix(),
		"aud":  j.appId,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.secret)
}
