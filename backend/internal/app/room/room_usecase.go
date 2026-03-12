package room

import (
	"Buzz/internal/domain/request"
	"Buzz/internal/domain/room"
	"Buzz/internal/entity"
	"context"
	"database/sql"
	"errors"
	"time"
)

var (
	ErrRoomNotFound        = errors.New("room not found")
	ErrUserNotFound        = errors.New("user not found")
	ErrNotInRoom           = errors.New("user is not a participant of this room")
	ErrAlreadyParticipant  = errors.New("user is already a participant")
	ErrInviteAlreadyExists = errors.New("invite already exists")
	ErrRequestNotFound     = errors.New("request not found")
	ErrNotAuthorized       = errors.New("not authorized to perform this action")
	ErrInvalidRequestType  = errors.New("invalid request type")
	ErrCannotInviteSelf    = errors.New("cannot invite yourself")
	ErrCannotRemoveSelf    = errors.New("cannot remove yourself")
	ErrNotAdmin            = errors.New("user is not the admin of this room")
)

type RoomUseCase struct {
	roomRepo    room.RoomRepository
	userRepo    room.UserRepository
	requestRepo request.RequestRepository
}

func NewRoomUseCase(roomRepo room.RoomRepository, userRepo room.UserRepository, requestRepo request.RequestRepository) *RoomUseCase {
	return &RoomUseCase{
		roomRepo:    roomRepo,
		userRepo:    userRepo,
		requestRepo: requestRepo,
	}
}

func (uc *RoomUseCase) CreateRoom(ctx context.Context, name string, icon *string, adminId string) error {
	room := &entity.Room{
		Name:    name,
		Icon:    icon,
		AdminId: adminId,
	}

	if err := uc.roomRepo.CreateRoom(ctx, room); err != nil {
		return err
	}

	if err := uc.roomRepo.AddParticipant(ctx, room.Id, adminId); err != nil {
		return err
	}
	return nil
}

func (uc *RoomUseCase) GetUserRooms(ctx context.Context, userId string) ([]entity.Room, error) {
	rooms, err := uc.roomRepo.GetByUser(ctx, userId)
	if err != nil {
		return nil, err
	}
	return rooms, nil
}

func (uc *RoomUseCase) GetRoom(ctx context.Context, roomId string) (*entity.Room, error) {
	room, err := uc.roomRepo.GetById(ctx, roomId)
	if err != nil {
		return nil, err
	}
	if room == nil {
		return nil, ErrRoomNotFound
	}
	return room, nil
}

func (uc *RoomUseCase) GetParticipants(ctx context.Context, roomId string) ([]entity.User, error) {
	participants, err := uc.roomRepo.GetParticipants(ctx, roomId)
	if err != nil {
		return nil, err
	}
	return participants, nil
}

func (uc *RoomUseCase) RemoveParticipants(ctx context.Context, roomId, adminId, userIdToRemove string) error {
	room, err := uc.roomRepo.GetById(ctx, roomId)
	if err != nil {
		return err
	}
	if room == nil {
		return ErrRoomNotFound
	}
	if room.AdminId == userIdToRemove {
		return ErrCannotRemoveSelf
	}
	if room.AdminId != adminId {
		return ErrNotAdmin
	}

	if err := uc.roomRepo.RemoveParticipant(ctx, roomId, userIdToRemove); err != nil {
		return err
	}

	return nil
}

func (uc *RoomUseCase) AppointAdmin(ctx context.Context, roomId, currentAdminId, newAdminId string) error {
	room, err := uc.roomRepo.GetById(ctx, roomId)
	if err != nil {
		return err
	}
	if room == nil {
		return ErrRoomNotFound
	}
	if room.AdminId != currentAdminId {
		return ErrNotAdmin
	}

	if err := uc.roomRepo.UpdateAdmin(ctx, roomId, newAdminId); err != nil {
		return err
	}

	return nil
}

func (uc *RoomUseCase) DeleteRoom(ctx context.Context, roomId, adminId string) error {
	room, err := uc.roomRepo.GetById(ctx, roomId)
	if err != nil {
		return err
	}
	if room == nil {
		return ErrRoomNotFound
	}

	if room.AdminId != adminId {
		return ErrNotAdmin
	}

	if err := uc.roomRepo.DeleteRoom(ctx, roomId); err != nil {
		return err
	}

	return nil
}

func (uc *RoomUseCase) SendRoomInvite(ctx context.Context, inviterId, roomId, targetUsername, targetCode string) error {
	room, err := uc.roomRepo.GetById(ctx, roomId)
	if err != nil {
		return err
	}
	if room == nil {
		return ErrRoomNotFound
	}

	targetUser, err := uc.userRepo.GetUserByUsernameAndCode(ctx, targetUsername, targetCode)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUserNotFound
		}
		return err
	}

	if targetUser.Id == inviterId {
		return ErrCannotInviteSelf
	}

	participants, err := uc.roomRepo.GetParticipants(ctx, roomId)
	if err != nil {
		return err
	}
	isParticipant := false
	for _, p := range participants {
		if p.Id == inviterId {
			isParticipant = true
			break
		}
	}
	if !isParticipant {
		return ErrNotInRoom
	}

	for _, p := range participants {
		if p.Id == targetUser.Id {
			return ErrAlreadyParticipant
		}
	}

	exists, err := uc.requestRepo.ExistsRoomPending(ctx, roomId, targetUser.Id)
	if err != nil {
		return err
	}
	if exists {
		return ErrInviteAlreadyExists
	}

	req := &entity.Request{
		SenderId:   inviterId,
		ReceiverId: targetUser.Id,
		Purpose:    "room",
		RoomId:     &roomId,
	}
	if err := uc.requestRepo.CreateRequest(ctx, req); err != nil {
		return err
	}

	return nil
}

type IncomingRequestInfo struct {
	Id        string    `json:"id"`
	Name      string    `json:"name"`
	Icon      *string   `json:"icon,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

func (uc *RoomUseCase) GetIncomingRequests(ctx context.Context, userId string) ([]IncomingRequestInfo, error) {
	requests, err := uc.requestRepo.GetIncoming(ctx, userId, "room", "pending")
	if err != nil {
		return nil, err
	}

	var result []IncomingRequestInfo
	for _, req := range requests {
		if req.RoomId == nil {
			continue
		}
		room, err := uc.roomRepo.GetById(ctx, *req.RoomId)
		if err != nil || room == nil {
			continue
		}
		result = append(result, IncomingRequestInfo{
			Id:        req.Id,
			Name:      room.Name,
			Icon:      room.Icon,
			CreatedAt: req.CreatedAt,
		})
	}
	return result, nil
}

func (uc *RoomUseCase) AcceptRoomInvite(ctx context.Context, userId, requestId string) error {
	req, err := uc.requestRepo.GetRequestById(ctx, requestId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRequestNotFound
		}
		return err
	}

	if req.Purpose != "room" {
		return ErrInvalidRequestType
	}
	if req.ReceiverId != userId {
		return ErrNotAuthorized
	}
	if req.RoomId == nil {
		return ErrInvalidRequestType
	}

	room, err := uc.roomRepo.GetById(ctx, *req.RoomId)
	if err != nil {
		return err
	}
	if room == nil {
		return ErrRoomNotFound
	}

	participants, err := uc.roomRepo.GetParticipants(ctx, *req.RoomId)
	if err != nil {
		return err
	}
	for _, r := range participants {
		if r.Id == userId {
			return ErrAlreadyParticipant
		}
	}

	if err := uc.roomRepo.AddParticipant(ctx, *req.RoomId, userId); err != nil {
		return err
	}

	if err := uc.requestRepo.UpdateStatus(ctx, requestId, "accepted"); err != nil {
		return err
	}

	return nil
}

func (uc *RoomUseCase) RejectRoomInvite(ctx context.Context, userId, requestId string) error {
	req, err := uc.requestRepo.GetRequestById(ctx, requestId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRequestNotFound
		}
		return err
	}

	if req.Purpose != "room" || req.ReceiverId != userId {
		return ErrNotAuthorized
	}

	if err := uc.requestRepo.Delete(ctx, requestId); err != nil {
		return err
	}

	return nil
}

func (uc *RoomUseCase) JoinRoomByInviteLink(ctx context.Context, roomId, userId string) error {
	_, err := uc.roomRepo.GetById(ctx, roomId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRoomNotFound
		}
		return err
	}

	participants, err := uc.roomRepo.GetParticipants(ctx, roomId)
	if err != nil {
		return err
	}
	for _, p := range participants {
		if p.Id == userId {
			return ErrAlreadyParticipant
		}
	}

	if err := uc.roomRepo.AddParticipant(ctx, roomId, userId); err != nil {
		return err
	}

	return nil
}
