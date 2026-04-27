package jitsi

import (
	"net/url"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JitsiJWT struct {
	secret []byte
	appId  string
	domain string
	expire time.Duration
}

type UserContext struct {
	ID          string
	DisplayName string
	Email       string
	AvatarURL   string
}

func NewJitsiJWT(secret, appId, serverURL string, expire time.Duration) *JitsiJWT {
	return &JitsiJWT{
		secret: []byte(secret),
		appId:  appId,
		domain: normalizeDomain(serverURL),
		expire: expire,
	}
}

func normalizeDomain(serverURL string) string {
	if serverURL == "" {
		return ""
	}

	if parsed, err := url.Parse(serverURL); err == nil && parsed.Hostname() != "" {
		return parsed.Hostname()
	}

	return strings.TrimSpace(strings.TrimPrefix(strings.TrimPrefix(serverURL, "https://"), "http://"))
}

func (j *JitsiJWT) GenerateToken(roomId string, user UserContext) (string, error) {
	now := time.Now()

	userClaims := map[string]interface{}{
		"id":   user.ID,
		"name": user.DisplayName,
	}
	if user.Email != "" {
		userClaims["email"] = user.Email
	}
	if user.AvatarURL != "" {
		userClaims["avatar"] = user.AvatarURL
	}

	claims := jwt.MapClaims{
		"iss":  j.appId,
		"sub":  j.domain,
		"room": roomId,
		"exp":  now.Add(j.expire).Unix(),
		"iat":  now.Unix(),
		"nbf":  now.Unix(),
		"aud":  j.appId,
		"context": map[string]interface{}{
			"user": userClaims,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.secret)
}
