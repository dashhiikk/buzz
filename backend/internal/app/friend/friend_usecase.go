package friend

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"

	"Buzz/internal/app/room"
	"Buzz/internal/domain/friend"
	"Buzz/internal/domain/request"
	"Buzz/internal/entity"
	ws "Buzz/internal/infra/websocket"
)

var (
	ErrUserNotFound        = errors.New("user not found")
	ErrFriendRequestToSelf = errors.New("cannot send friend request  to yourself")
	ErrFriendRequestExists = errors.New("friend request already pending")
	ErrRequestNotFound     = errors.New("request not found")
	ErrNotAuthorized       = errors.New("not authorized to refrom this action")
	ErrNotFriends          = errors.New("users were not friends")
)

type FriendUseCase struct {
	requestRepo     request.RequestRepository
	userRepo        friend.FriendRepository
	roomUseCase     *room.RoomUseCase
	notificationHub *ws.NotificationHub
}

func NewFriendUseCase(requestRepo request.RequestRepository, userRepo friend.FriendRepository, roomUseCase *room.RoomUseCase, notificationHub *ws.NotificationHub) *FriendUseCase {
	return &FriendUseCase{
		requestRepo:     requestRepo,
		userRepo:        userRepo,
		roomUseCase:     roomUseCase,
		notificationHub: notificationHub,
	}
}

func (uc *FriendUseCase) SendFriendRequest(ctx context.Context, senderId, targetUsername, targetCode string) error {
	targetUser, err := uc.userRepo.GetUserByUsernameAndCode(ctx, targetUsername, targetCode)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUserNotFound
		}
		return err
	}

	if targetUser.Id == senderId {
		return ErrFriendRequestToSelf
	}

	exists, err := uc.requestRepo.ExistsFriendPending(ctx, senderId, targetUser.Id, "friend")
	if err != nil {
		return err
	}
	if exists {
		return ErrFriendRequestExists
	}

	req := &entity.Request{
		SenderId:   senderId,
		ReceiverId: targetUser.Id,
		Purpose:    "friend",
		RoomId:     nil,
	}

	if err := uc.requestRepo.CreateRequest(ctx, req); err != nil {
		return err
	}

	if uc.notificationHub != nil {
		sender, err := uc.userRepo.GetUserById(ctx, senderId)
		if err == nil {
			notif := map[string]interface{}{
				"type": "friend_request",
				"data": map[string]interface{}{
					"requestId": req.Id,
					"from": map[string]string{
						"id":       senderId,
						"username": sender.Username,
						"code":     sender.Code,
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

func (uc *FriendUseCase) AcceptFriendRequest(ctx context.Context, requestId string) error {
	if err := uc.requestRepo.UpdateStatus(ctx, requestId, "accepted"); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRequestNotFound
		}
		return err
	}

	req, err := uc.requestRepo.GetRequestById(ctx, requestId)
	if err != nil {
		return err
	}

	if err := uc.roomUseCase.CreatePrivateRoom(ctx, req.SenderId, req.ReceiverId); err != nil {
		log.Printf("failed to create private room for users %s and %s: %v", req.SenderId, req.ReceiverId, err)
	}

	if uc.notificationHub != nil {
		receiver, err := uc.userRepo.GetUserById(ctx, req.ReceiverId)
		if err == nil {
			notif := map[string]interface{}{
				"type": "friend_request_accepted",
				"data": map[string]interface{}{
					"requestId": requestId,
					"from": map[string]string{
						"id":       receiver.Id,
						"username": receiver.Username,
						"code":     receiver.Code,
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

func (uc *FriendUseCase) RejectFriendRequest(ctx context.Context, requestId string) error {
	if err := uc.requestRepo.UpdateStatus(ctx, requestId, "rejected"); err != nil {
		return err
	}

	if uc.notificationHub != nil {
		req, err := uc.requestRepo.GetRequestById(ctx, requestId)
		if err != nil {
			log.Printf("failed to get request: %v", err)
			return nil
		}
		receiver, err := uc.userRepo.GetUserById(ctx, req.ReceiverId)
		if err == nil {
			notif := map[string]interface{}{
				"type": "friend_request_rejected",
				"data": map[string]interface{}{
					"requestId": requestId,
					"from": map[string]string{
						"id":       receiver.Id,
						"username": receiver.Username,
						"code":     receiver.Code,
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

func (uc *FriendUseCase) GetFriends(ctx context.Context, userId string) ([]entity.User, error) {
	friends, err := uc.requestRepo.GetAcceptedFriends(ctx, userId)
	if err != nil {
		return nil, err
	}
	return friends, nil
}

func (uc *FriendUseCase) RemoveFriend(ctx context.Context, userId, friendId string) error {
	_, err := uc.userRepo.GetUserById(ctx, friendId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUserNotFound
		}
		return err
	}

	err = uc.requestRepo.DeleteFriendship(ctx, userId, friendId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFriends
		}
		return err
	}

	if err := uc.roomUseCase.DeletePrivateRoom(ctx, userId, friendId); err != nil {
		log.Printf("failed to delete private room for users %s and %s: %v", userId, friendId, err)
	}

	return nil
}
