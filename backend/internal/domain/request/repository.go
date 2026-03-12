package request

import (
	"Buzz/internal/entity"
	"context"
)

type RequestRepository interface {
	CreateRequest(ctx context.Context, req *entity.Request) error
	GetRequestById(ctx context.Context, id string) (*entity.Request, error)
	GetIncoming(ctx context.Context, userId, purpose, status string) ([]entity.Request, error)
	UpdateStatus(ctx context.Context, id, status string) error
	Delete(ctx context.Context, id string) error
	ExistsFriendPending(ctx context.Context, userId1, userId2, purpose string) (bool, error)
	ExistsRoomPending(ctx context.Context, roomId, receiverId string) (bool, error)
	GetAcceptedFriends(ctx context.Context, userId string) ([]entity.User, error)
}
