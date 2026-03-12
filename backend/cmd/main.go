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

	"Buzz/internal/infra/config"
	"Buzz/internal/infra/database"
	"Buzz/internal/infra/email"
	"Buzz/internal/infra/repositories"
	appMiddleware "Buzz/internal/middleware"
	"Buzz/pkg/hash"
	"Buzz/pkg/jwt"

	"Buzz/internal/app/auth"
	"Buzz/internal/app/friend"

	authHandler "Buzz/internal/interfaces/http/auth"
	friendHandler "Buzz/internal/interfaces/http/friend"
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

	hasher := hash.NewBcryptHasher()
	jwtService := jwt.NewJWTService(cfg.JWT.SecretKey, cfg.JWT.AccessExpire)
	emailSender := email.NewMockSender()

	userRepo := repositories.NewUserRepository(db)
	requestRepo := repositories.NewRequestRepository(db)

	authUseCase := auth.NewAuthUseCase(userRepo, hasher, jwtService, emailSender)
	friendUseCase := friend.NewFriendUseCase(requestRepo, userRepo)

	authHTTPHandler := authHandler.NewHandler(authUseCase)
	friendHTTPHandler := friendHandler.NewHandler(friendUseCase)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", authHTTPHandler.Register)
		r.Post("/login", authHTTPHandler.Login)
		r.Post("/password-reset", authHTTPHandler.RequestPasswordReset)
		r.Post("/reset-password", authHTTPHandler.ResetPassword)
	})

	r.Group(func(r chi.Router) {
		r.Use(appMiddleware.AuthMiddleware(jwtService))

		r.Route("/friends", func(r chi.Router) {
			r.Get("/", friendHTTPHandler.GetFriends)
			r.Post("/send-request", friendHTTPHandler.SendFriendRequest)
		})

		r.Route("/requests", func(r chi.Router) {
			r.Get("/friends", friendHTTPHandler.GetIncomingRequests)
			r.Post("/{id}/accept", friendHTTPHandler.AcceptFriendRequest)
			r.Post("/{id}/reject", friendHTTPHandler.RejectFriendRequest)
		})
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
