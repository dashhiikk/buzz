package request

import "context"

type FriendHandler interface {
	AcceptFriendRequest(ctx context.Context, requestId string) error
	RejectFriendRequest(ctx context.Context, requestId string) error
}

type RoomHandler interface {
	AcceptRoomInvite(ctx context.Context, userId, requestId string) error
	RejectRoomInvite(ctx context.Context, userId, requestId string) error
}
