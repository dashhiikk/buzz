package room

import (
	"Buzz/internal/domain/request"
	"Buzz/internal/domain/room"
	"Buzz/internal/entity"
	ws "Buzz/internal/infra/websocket"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"time"

	"github.com/google/uuid"
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
	ErrPrivateRoom         = errors.New("this action not aviable in private room")
)

type RoomUseCase struct {
	roomRepo        room.RoomRepository
	userRepo        room.UserRepository
	requestRepo     request.RequestRepository
	notificationHub *ws.NotificationHub
}

func NewRoomUseCase(roomRepo room.RoomRepository, userRepo room.UserRepository, requestRepo request.RequestRepository, notificationHub *ws.NotificationHub) *RoomUseCase {
	return &RoomUseCase{
		roomRepo:        roomRepo,
		userRepo:        userRepo,
		requestRepo:     requestRepo,
		notificationHub: notificationHub,
	}
}

func (uc *RoomUseCase) CreateRoom(ctx context.Context, name string, icon *string, adminId string) error {
	if icon == nil {
		defaultIcon := "/uploads/default-room-icon.jpg"
		icon = &defaultIcon
	}

	room := &entity.Room{
		Name:      name,
		Icon:      icon,
		AdminId:   adminId,
		IsPrivate: false,
	}

	if err := uc.roomRepo.CreateRoom(ctx, room); err != nil {
		return err
	}

	inviteToken := uuid.New().String()
	if err := uc.roomRepo.SetInviteToken(ctx, room.Id, inviteToken); err != nil {
		log.Printf("failed to set invite tokev: %v", err)
	}

	if err := uc.roomRepo.AddParticipant(ctx, room.Id, adminId); err != nil {
		return err
	}

	return nil
}

func (uc *RoomUseCase) CreatePrivateRoom(ctx context.Context, userId1, userId2 string) error {
	room := &entity.Room{
		Name:      "private-room",
		Icon:      nil,
		AdminId:   userId1,
		IsPrivate: true,
	}

	if err := uc.roomRepo.CreateRoom(ctx, room); err != nil {
		return err
	}

	if err := uc.roomRepo.AddParticipant(ctx, room.Id, userId1); err != nil {
		return err
	}
	if err := uc.roomRepo.AddParticipant(ctx, room.Id, userId2); err != nil {
		return err
	}

	return nil
}

type UserRoom struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Icon      *string   `json:"icon,omitempty"`
	AdminID   string    `json:"adminId"`
	CreatedAt time.Time `json:"createdAt"`
	IsPrivate bool      `json:"isPrivate"`
}

func (uc *RoomUseCase) GetUserRooms(ctx context.Context, userId string) ([]UserRoom, error) {
	rooms, err := uc.roomRepo.GetByUser(ctx, userId)
	if err != nil {
		return nil, err
	}

	result := make([]UserRoom, 0, len(rooms))
	for _, room := range rooms {
		ur := UserRoom{
			ID:        room.Id,
			Name:      room.Name,
			Icon:      room.Icon,
			AdminID:   room.AdminId,
			CreatedAt: room.CreatedAt,
			IsPrivate: room.IsPrivate,
		}

		if room.IsPrivate {
			participants, err := uc.roomRepo.GetParticipants(ctx, room.Id)
			if err != nil {
				result = append(result, ur)
				continue
			}

			var other *entity.User
			for _, p := range participants {
				if p.Id != userId {
					other = &p
					break
				}
			}
			if other != nil {
				ur.Name = other.Username
				ur.Icon = other.Avatar
			}
		}
		result = append(result, ur)
	}

	return result, nil
}

func (uc *RoomUseCase) GetRoom(ctx context.Context, roomId string) (*entity.Room, error) {
	room, err := uc.roomRepo.GetRoomById(ctx, roomId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRoomNotFound
		}
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

func (uc *RoomUseCase) SendRoomInvite(ctx context.Context, inviterId, roomId, targetUsername, targetCode string) error {
	room, err := uc.roomRepo.GetRoomById(ctx, roomId)
	if err != nil {
		return err
	}
	if room == nil {
		return ErrRoomNotFound
	}

	if room.IsPrivate {
		return ErrPrivateRoom
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

	if uc.notificationHub != nil {
		inviter, err := uc.userRepo.GetUserById(ctx, inviterId)
		if err == nil {
			notif := map[string]interface{}{
				"type": "room_invite",
				"data": map[string]interface{}{
					"requestId": req.Id,
					"from": map[string]string{
						"id":       inviter.Id,
						"username": inviter.Username,
						"code":     inviter.Code,
					},
					"room": map[string]string{
						"id":   room.Id,
						"name": room.Name,
					},
					"createdAt": req.CreatedAt,
				},
			}
			payload, _ := json.Marshal(notif)
			uc.notificationHub.SendToUser(targetUser.Id, payload)
		} else {
			log.Printf("failed to get sender info for notification: %v", err)
		}
	}

	return nil
}

func (uc *RoomUseCase) AcceptRoomInvite(ctx context.Context, userId, requestId string) error {
	req, err := uc.requestRepo.GetRequestById(ctx, requestId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRequestNotFound
		}
		return err
	}

	room, err := uc.roomRepo.GetRoomById(ctx, *req.RoomId)
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

	if uc.notificationHub != nil {
		receiver, err := uc.userRepo.GetUserById(ctx, req.ReceiverId)
		if err == nil {
			notif := map[string]interface{}{
				"type": "room_invite_accepted",
				"data": map[string]interface{}{
					"requestId": requestId,
					"from": map[string]string{
						"id":       receiver.Id,
						"username": receiver.Username,
						"code":     receiver.Code,
					},
					"room": map[string]string{
						"id":   room.Id,
						"name": room.Name,
					},
				},
			}
			payload, _ := json.Marshal(notif)
			uc.notificationHub.SendToUser(req.SenderId, payload)
		} else {
			log.Printf("failed to get sender info for notification: %v", err)
		}
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

	var room *entity.Room
	if req.RoomId != nil {
		room, err = uc.roomRepo.GetRoomById(ctx, *req.RoomId)
		if err != nil {
			return err
		}
		if room == nil {
			return ErrRoomNotFound
		}
	}

	if err := uc.requestRepo.UpdateStatus(ctx, requestId, "rejected"); err != nil {
		return err
	}

	if uc.notificationHub != nil {
		receiver, err := uc.userRepo.GetUserById(ctx, req.ReceiverId)
		if err == nil {
			data := map[string]interface{}{
				"requestId": requestId,
				"from": map[string]string{
					"id":       receiver.Id,
					"username": receiver.Username,
					"code":     receiver.Code,
				},
			}
			if room != nil {
				data["room"] = map[string]string{
					"id":   room.Id,
					"name": room.Name,
				}
			}

			notif := map[string]interface{}{
				"type": "room_invite_rejected",
				"data": data,
			}
			payload, _ := json.Marshal(notif)
			uc.notificationHub.SendToUser(req.SenderId, payload)
		} else {
			log.Printf("failed to get sender info for notification: %v", err)
		}
	}

	return nil
}

func (uc *RoomUseCase) JoinRoomByInviteLink(ctx context.Context, roomId, userId string) error {
	room, err := uc.roomRepo.GetRoomById(ctx, roomId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRoomNotFound
		}
		return err
	}

	if room.IsPrivate {
		return ErrPrivateRoom
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

func (uc *RoomUseCase) RemoveParticipant(ctx context.Context, roomId, adminId, userIdToRemove string) error {
	room, err := uc.roomRepo.GetRoomById(ctx, roomId)
	if err != nil {
		return err
	}
	if room == nil {
		return ErrRoomNotFound
	}

	if room.IsPrivate {
		return ErrPrivateRoom
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

	uc.notifyRoomAccessRevoked(room, userIdToRemove)

	return nil
}

func (uc *RoomUseCase) AppointAdmin(ctx context.Context, roomId, currentAdminId, newAdminId string) error {
	room, err := uc.roomRepo.GetRoomById(ctx, roomId)
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
	room, err := uc.roomRepo.GetRoomById(ctx, roomId)
	if err != nil {
		return err
	}
	if room == nil {
		return ErrRoomNotFound
	}

	if room.IsPrivate {
		return ErrPrivateRoom
	}

	if room.AdminId != adminId {
		return ErrNotAdmin
	}

	participants, err := uc.roomRepo.GetParticipants(ctx, roomId)
	if err != nil {
		return err
	}

	if err := uc.roomRepo.DeleteRoom(ctx, roomId); err != nil {
		return err
	}

	uc.notifyRoomDeleted(room, participants)

	return nil
}

func (uc *RoomUseCase) DeletePrivateRoom(ctx context.Context, userId1, userId2 string) error {
	rooms, err := uc.roomRepo.GetByUser(ctx, userId1)
	if err != nil {
		return err
	}
	for _, room := range rooms {
		if !room.IsPrivate {
			continue
		}
		participants, err := uc.roomRepo.GetParticipants(ctx, room.Id)
		if err != nil {
			continue
		}

		hasUser2 := false
		for _, p := range participants {
			if p.Id == userId2 {
				hasUser2 = true
				break
			}
		}
		if hasUser2 {
			if err := uc.roomRepo.DeleteRoom(ctx, room.Id); err != nil {
				return err
			}
			roomCopy := room
			uc.notifyRoomDeleted(&roomCopy, participants)
			break
		}
	}
	return nil
}

func (uc *RoomUseCase) LeaveRoom(ctx context.Context, userId, roomId string) error {
	participants, err := uc.roomRepo.GetParticipants(ctx, roomId)
	if err != nil {
		return err
	}

	isParticipant := false
	for _, p := range participants {
		if userId == p.Id {
			isParticipant = true
			break
		}
	}
	if !isParticipant {
		return ErrNotInRoom
	}

	room, err := uc.roomRepo.GetRoomById(ctx, roomId)
	if err != nil {
		return err
	}
	if room == nil {
		return ErrRoomNotFound
	}

	if room.IsPrivate {
		return ErrPrivateRoom
	}

	if room.AdminId == userId && len(participants) == 1 {
		if err := uc.roomRepo.DeleteRoom(ctx, roomId); err != nil {
			return err
		}
	}

	if room.AdminId == userId && len(participants) > 1 {
		var newAdminId string
		for _, p := range participants {
			if p.Id != userId {
				newAdminId = p.Id
				break
			}
		}
		if err := uc.roomRepo.UpdateAdmin(ctx, roomId, newAdminId); err != nil {
			return err
		}
	}

	if err := uc.roomRepo.RemoveParticipant(ctx, roomId, userId); err != nil {
		return err
	}

	return nil
}

func (uc *RoomUseCase) notifyRoomDeleted(room *entity.Room, participants []entity.User) {
	if uc.notificationHub == nil || room == nil || len(participants) == 0 {
		return
	}

	notif := map[string]interface{}{
		"type": "room_deleted",
		"data": map[string]interface{}{
			"roomId": room.Id,
			"room": map[string]string{
				"id":   room.Id,
				"name": room.Name,
			},
		},
	}
	payload, err := json.Marshal(notif)
	if err != nil {
		log.Printf("failed to marshal room_deleted notification: %v", err)
		return
	}

	for _, participant := range participants {
		uc.notificationHub.SendToUser(participant.Id, payload)
	}
}

func (uc *RoomUseCase) notifyRoomAccessRevoked(room *entity.Room, userId string) {
	if uc.notificationHub == nil || room == nil || userId == "" {
		return
	}

	notif := map[string]interface{}{
		"type": "room_access_revoked",
		"data": map[string]interface{}{
			"roomId": room.Id,
			"reason": "removed",
			"room": map[string]string{
				"id":   room.Id,
				"name": room.Name,
			},
		},
	}
	payload, err := json.Marshal(notif)
	if err != nil {
		log.Printf("failed to marshal room_access_revoked notification: %v", err)
		return
	}

	uc.notificationHub.SendToUser(userId, payload)
}

func (uc *RoomUseCase) GetInviteToken(ctx context.Context, roomId string) (string, error) {
	room, err := uc.roomRepo.GetRoomById(ctx, roomId)
	if err != nil {
		return "", err
	}

	if room == nil {
		return "", ErrRoomNotFound
	}

	if room.InviteToken != nil {
		return *room.InviteToken, nil
	}

	token := uuid.New().String()
	if err := uc.roomRepo.SetInviteToken(ctx, roomId, token); err != nil {
		return "", err
	}

	return token, nil
}

func (uc *RoomUseCase) GetRoomIdByInviteToken(ctx context.Context, token string) (string, error) {
	return uc.roomRepo.GetRoomIdByInviteToken(ctx, token)
}
