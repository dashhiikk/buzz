package friend

import (
	"context"
	"database/sql"
	"errors"

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
	ErrNotFriends          = errors.New("users were not friends")
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

func (uc *FriendUseCase) AcceptFriendRequest(ctx context.Context, requestId string) error {
	if err := uc.requestRepo.UpdateStatus(ctx, requestId, "accepted"); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrRequestNotFound
		}
		return err
	}
	// создать личную комнату
	return nil
}

func (uc *FriendUseCase) RejectFriendRequest(ctx context.Context, requestId string) error {
	if err := uc.requestRepo.DeleteRequest(ctx, requestId); err != nil {
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

	return nil
}
