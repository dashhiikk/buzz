package friend

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"Buzz/internal/domain/friend"
	"Buzz/internal/domain/request"
	"Buzz/internal/entity"
)

var (
	ErrUserNotFound        = errors.New("user not found")
	ErrFriendRequestToSelf = errors.New("cannot send friend request  to yourself")
	ErrFriendRequestExists = errors.New("friend request already pending")
	ErrRequestNotFound     = errors.New("request not found")
	ErrNotAuthorized       = errors.New("not authorized to refrom this action")
)

type FriendUseCase struct {
	requestRepo request.RequestRepository
	userRepo    friend.FriendRepository
}

func NewFriendUseCase(requestRepo request.RequestRepository, userRepo friend.FriendRepository) *FriendUseCase {
	return &FriendUseCase{
		requestRepo: requestRepo,
		userRepo:    userRepo,
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

	return nil
}

type IncomingRequestInfo struct {
	Id        string    `json:"id"`
	Username  string    `json:"username"`
	Code      string    `json:"code"`
	Avatar    *string   `json:"avatar,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

func (uc *FriendUseCase) GetIncomingRequests(ctx context.Context, userId string) ([]IncomingRequestInfo, error) {
	requests, err := uc.requestRepo.GetIncoming(ctx, userId, "friend", "pending")
	if err != nil {
		return nil, err
	}

	var result []IncomingRequestInfo
	for _, req := range requests {
		sender, err := uc.userRepo.GetUserById(ctx, req.SenderId)
		if err != nil {
			continue
		}
		result = append(result, IncomingRequestInfo{
			Id:        req.Id,
			Username:  sender.Id,
			Code:      sender.Code,
			Avatar:    sender.Avatar,
			CreatedAt: req.CreatedAt,
		})
	}

	return result, nil
}

func (uc *FriendUseCase) AcceptFriendRequest(ctx context.Context, userId, requestId string) error {
	req, err := uc.requestRepo.GetRequestById(ctx, requestId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRequestNotFound
		}
		return err
	}

	if req.ReceiverId != userId || req.Purpose != "friend" {
		return ErrNotAuthorized
	}

	if err := uc.requestRepo.UpdateStatus(ctx, req.Id, "accepted"); err != nil {
		return err
	}

	return nil
}

func (uc *FriendUseCase) RejectFriendRequest(ctx context.Context, userId, requestId string) error {
	req, err := uc.requestRepo.GetRequestById(ctx, requestId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRequestNotFound
		}
		return err
	}

	if req.ReceiverId != userId || req.Purpose != "friend" {
		return ErrNotAuthorized
	}

	if err := uc.requestRepo.Delete(ctx, req.Id); err != nil {
		return err
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
