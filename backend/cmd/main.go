package main

import (
	_ "Buzz/docs"

	httpSwagger "github.com/swaggo/http-swagger"

	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"Buzz/internal/infra/config"
	"Buzz/internal/infra/database"
	"Buzz/internal/infra/email"
	"Buzz/internal/infra/repositories"
	ws "Buzz/internal/infra/websocket"
	appMiddleware "Buzz/internal/middleware"
	"Buzz/pkg/hash"
	"Buzz/pkg/jitsi"
	"Buzz/pkg/jwt"

	"Buzz/internal/app/auth"
	"Buzz/internal/app/board"
	"Buzz/internal/app/chat"
	"Buzz/internal/app/friend"
	"Buzz/internal/app/request"
	"Buzz/internal/app/room"

	authHandler "Buzz/internal/interfaces/http/auth"
	boardHandler "Buzz/internal/interfaces/http/board"
	chatHandler "Buzz/internal/interfaces/http/chat"
	friendHandler "Buzz/internal/interfaces/http/friend"
	jitsiHandler "Buzz/internal/interfaces/http/jitsi"
	notificationHandler "Buzz/internal/interfaces/http/notification"
	requestHandler "Buzz/internal/interfaces/http/request"
	roomHandler "Buzz/internal/interfaces/http/room"
)

// @title           Buzz API
// @version         1.0
// @description     Серверная часть веб-приложения для коммуникации.
// @termsOfService  http://swagger.io/terms/

// @contact.name   Дарья
// @contact.email  alisfrk2004@gmail.com

// @host      localhost:8080
// @BasePath  /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Введите токен в формате "Bearer <token>"

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
	jitsiJWT := jitsi.NewJitsiJWT(cfg.Jitsi.JWTSecret, cfg.Jitsi.AppID, 1*time.Hour)

	userRepo := repositories.NewUserRepository(db)
	requestRepo := repositories.NewRequestRepository(db)
	roomRepo := repositories.NewRoomRepository(db)
	chatRepo := repositories.NewChatRepository(db)
	boardRepo := repositories.NewBoardRepository(db)

	notificationHub := ws.NewNotificationHub()
	go notificationHub.Run()

	authUseCase := auth.NewAuthUseCase(userRepo, hasher, jwtService, emailSender)
	roomUseCase := room.NewRoomUseCase(roomRepo, userRepo, requestRepo, notificationHub)
	friendUseCase := friend.NewFriendUseCase(requestRepo, userRepo, roomUseCase, notificationHub)
	requestUseCase := request.NewRequestUseCase(requestRepo, userRepo, roomRepo, friendUseCase, roomUseCase)
	chatUseCase := chat.NewChatUseCase(chatRepo, roomRepo, notificationHub)
	boardUseCase := board.NewBoardUseCase(boardRepo)

	hub := ws.NewHub()
	go hub.Run()

	authHTTPHandler := authHandler.NewHandler(authUseCase)
	friendHTTPHandler := friendHandler.NewHandler(friendUseCase)
	roomHTTPHandler := roomHandler.NewHandler(roomUseCase, cfg.AppURL)
	requestHTTPHandler := requestHandler.NewHandler(requestUseCase)
	chatHTTPHandler := chatHandler.NewHandler(chatUseCase, roomUseCase, hub)
	boardHTTPHandler := boardHandler.NewHandler(boardUseCase, roomUseCase, hub)
	jitsiHTTPHandler := jitsiHandler.NewHandler(jitsiJWT, roomUseCase, cfg.Jitsi.ServerUrl)
	notificationWSHandler := notificationHandler.NewHandler(notificationHub)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, //адрес запуска фронта
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("http://localhost:8080/swagger/doc.json"),
	))
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(http.Dir(cfg.Upload.Path))))

	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", authHTTPHandler.Register)
		r.Post("/verify", authHTTPHandler.VerifyEmail)
		r.Post("/login", authHTTPHandler.Login)
		r.Post("/password-reset", authHTTPHandler.RequestPasswordReset)
		r.Post("/update-password", authHTTPHandler.UpdatePassword)
	})

	r.Group(func(r chi.Router) {
		r.Use(appMiddleware.AuthMiddleware(jwtService))

		r.Get("/ws/notifications", notificationWSHandler.ServeWebSocket)

		r.Route("/friends", func(r chi.Router) {
			r.Get("/", friendHTTPHandler.GetFriends)
			r.Post("/send-request", friendHTTPHandler.SendFriendRequest)
			r.Delete("/{friendId}", friendHTTPHandler.RemoveFriend)
		})

		r.Route("/requests", func(r chi.Router) {
			r.Get("/", requestHTTPHandler.GetIncomingRequests)
			r.Get("/outgoing", requestHTTPHandler.GetOutgoingRequests)
			r.Post("/{id}/accept", requestHTTPHandler.AcceptRequest)
			r.Post("/{id}/reject", requestHTTPHandler.RejectRequest)
			r.Delete("/{id}", requestHTTPHandler.CancelRequest)
		})

		r.Route("/rooms", func(r chi.Router) {
			r.Get("/", roomHTTPHandler.GetUserRooms)
			r.Post("/create", roomHTTPHandler.CreateRoom)
			r.Get("/{id}", roomHTTPHandler.GetRoom)
			r.Get("/{id}/participants", roomHTTPHandler.GetParticipants)
			r.Post("/{id}/send-invite", roomHTTPHandler.SendRoomInvite)
			r.Post("/join/{token}", roomHTTPHandler.JoinRoomByToken)
			r.Delete("/{id}/participants/{userId}", roomHTTPHandler.RemoveParticipant)
			r.Post("/{id}/admin", roomHTTPHandler.AppointAdmin)
			r.Get("/{id}/invite-link", roomHTTPHandler.GetInviteLink)
			r.Delete("/{id}", roomHTTPHandler.DeleteRoom)
			r.Post("/{id}/leave", roomHTTPHandler.LeaveRoom)
			r.Get("/{id}/text-chat", chatHTTPHandler.GetHistory)
			r.Get("/{id}/board", boardHTTPHandler.GetState)
			r.Get("/{id}/voice-chat", jitsiHTTPHandler.GetToken)
		})

		r.Get("/ws/chat", chatHTTPHandler.ServeWebSocket)
		r.Get("/ws/board", boardHTTPHandler.ServeWebSocket)
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
