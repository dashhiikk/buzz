package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"Buzz/internal/app/auth"
	"Buzz/internal/infra/config"
	"Buzz/internal/infra/database"
	"Buzz/internal/infra/email"
	"Buzz/internal/infra/repositories"
	authHandler "Buzz/internal/interfaces/http/auth"
	"Buzz/pkg/hash"
	"Buzz/pkg/jwt"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := database.NewDB(&cfg.DB)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	userRepo := repositories.NewUserRepository(db)
	hasher := hash.NewBcryptHasher()
	jwtService := jwt.NewJWTService(cfg.JWT.SecretKey, cfg.JWT.AccessExpire)
	emailSender := email.NewMockSender()

	authUseCase := auth.NewAuthUseCase(userRepo, hasher, jwtService, emailSender)

	authHTTPHandler := authHandler.NewHandler(authUseCase)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", authHTTPHandler.Register)
		r.Post("/login", authHTTPHandler.Login)
		r.Post("/password-reset", authHTTPHandler.RequestPasswordReset)
		r.Post("reset-password", authHTTPHandler.ResetPassword)
	})

	server := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      r,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server stopped")
}
