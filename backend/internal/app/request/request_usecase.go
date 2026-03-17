package request

import (
	"context"
	"database/sql"
	"errors"
	"sort"
	"time"

	"Buzz/internal/domain/request"
	"Buzz/internal/entity"
)

var (
	ErrRequestNotFound    = errors.New("request not found")
	ErrNotAuthorized      = errors.New("not authorized to act on this request")
	ErrInvalidRequestType = errors.New("invalid request type")
	ErrRequestNotPending  = errors.New("request is not pending")
)

type UserInfoProvider interface {
	GetUserById(ctx context.Context, id string) (*entity.User, error)
}

type RoomInfoProvider interface {
	GetRoomById(ctx context.Context, id string) (*entity.Room, error)
}

type RequestUseCase struct {
	requestRepo   request.RequestRepository
	userProvider  UserInfoProvider
	roomProvider  RoomInfoProvider
	friendHandler FriendHandler
	roomHandler   RoomHandler
}

func NewRequestUseCase(
	requestRepo request.RequestRepository,
	userProvider UserInfoProvider,
	roomProvider RoomInfoProvider,
	friendHandler FriendHandler,
	roomHandler RoomHandler,
) *RequestUseCase {
	return &RequestUseCase{
		requestRepo:   requestRepo,
		userProvider:  userProvider,
		roomProvider:  roomProvider,
		friendHandler: friendHandler,
		roomHandler:   roomHandler,
	}
}

type IncomingRequest struct {
	Id        string    `json:"id"`
	Type      string    `json:"type"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`

	SenderId     string  `json:"senderId,omitempty"`
	SenderName   string  `json:"senderName,omitempty"`
	SenderCode   string  `json:"senderCode,omitempty"`
	SenderAvatar *string `json:"senderAvatar,omitempty"`

	RoomId   string  `json:"roomId,omitempty"`
	RoomName string  `json:"roomName,omitempty"`
	RoomIcon *string `json:"roomIcon,omitempty"`
}

func (uc *RequestUseCase) GetIncomingRequests(ctx context.Context, userId string) ([]IncomingRequest, error) {
	var result []IncomingRequest

	requests, err := uc.requestRepo.GetIncoming(ctx, userId, "pending")
	if err != nil {
		return nil, err
	}

	for _, req := range requests {
		switch req.Purpose {
		case "friend":
			sender, err := uc.userProvider.GetUserById(ctx, req.SenderId)
			if err != nil || sender == nil {
				continue
			}
			result = append(result, IncomingRequest{
				Id:           req.Id,
				Type:         "friend",
				Status:       req.Status,
				CreatedAt:    req.CreatedAt,
				SenderId:     sender.Id,
				SenderName:   sender.Username,
				SenderCode:   sender.Code,
				SenderAvatar: sender.Avatar,
			})
		case "room":
			room, err := uc.roomProvider.GetRoomById(ctx, *req.RoomId)
			if err != nil || room == nil {
				continue
			}
			result = append(result, IncomingRequest{
				Id:        req.Id,
				Type:      "room",
				Status:    req.Status,
				CreatedAt: req.CreatedAt,
				RoomId:    room.Id,
				RoomName:  room.Name,
				RoomIcon:  room.Icon,
			})
		}
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].CreatedAt.After(result[j].CreatedAt)
	})

	return result, nil
}

func (uc *RequestUseCase) AcceptRequest(ctx context.Context, userId, requestId string) error {
	req, err := uc.requestRepo.GetRequestById(ctx, requestId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRequestNotFound
		}
		return err
	}

	if req.ReceiverId != userId {
		return ErrNotAuthorized
	}

	if req.Status != "pending" {
		return ErrRequestNotPending
	}

	switch req.Purpose {
	case "friend":
		return uc.friendHandler.AcceptFriendRequest(ctx, requestId)
	case "room":
		return uc.roomHandler.AcceptRoomInvite(ctx, userId, requestId)
	default:
		return ErrInvalidRequestType
	}
}

func (uc *RequestUseCase) RejectRequest(ctx context.Context, userId, requestId string) error {
	req, err := uc.requestRepo.GetRequestById(ctx, requestId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRequestNotFound
		}
		return err
	}

	if req.ReceiverId != userId {
		return ErrNotAuthorized
	}

	switch req.Purpose {
	case "friend":
		return uc.friendHandler.RejectFriendRequest(ctx, requestId)
	case "room":
		return uc.roomHandler.RejectRoomInvite(ctx, userId, requestId)
	default:
		return ErrInvalidRequestType
	}
}
