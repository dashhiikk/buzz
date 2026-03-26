package room

import (
	"Buzz/internal/entity"
	"context"
)

type RoomRepository interface {
	CreateRoom(ctx context.Context, room *entity.Room) error
	GetRoomById(ctx context.Context, id string) (*entity.Room, error)
	GetByUser(ctx context.Context, userId string) ([]entity.Room, error)
	AddParticipant(ctx context.Context, roomId, userId string) error
	RemoveParticipant(ctx context.Context, roomId, userId string) error
	GetParticipants(ctx context.Context, roomId string) ([]entity.User, error)
	UpdateAdmin(ctx context.Context, roomId, newAdminId string) error
	DeleteRoom(ctx context.Context, id string) error
	SetInviteToken(ctx context.Context, roomID, token string) error
	GetRoomIdByInviteToken(ctx context.Context, token string) (string, error)
}
