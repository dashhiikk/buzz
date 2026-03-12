package middleware

import (
	"Buzz/pkg/jwt"
	"context"
	"net/http"
	"strings"
)

type contextKey string

const UserIdKey contextKey = "userId"

func AuthMiddleware(jwtService jwt.Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				http.Error(w, "invalid authorization header", http.StatusUnauthorized)
				return
			}

			tokenStr := parts[1]
			claims, err := jwtService.Validate(tokenStr)
			if err != nil {
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserIdKey, claims.UserId)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
