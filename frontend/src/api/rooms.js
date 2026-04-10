import apiClient from './client';

export const getRooms = () => apiClient.get('/rooms');
export const createRoom = (name, icon) => apiClient.post('/rooms/create', { name, icon })
export const getRoom = (id) => apiClient.get(`/rooms/${id}`);
export const getParticipants = (id) => apiClient.get(`/rooms/${id}/participants`);
export const getMessages = (roomId, limit = 50, offset = 0) =>
    apiClient.get(`/rooms/${roomId}/text-chat?limit=${limit}&offset=${offset}`);
export const sendMessage = (roomId, text, files = []) =>
    apiClient.post(`/rooms/${roomId}/text-chat`, { text, files }); // если у вас такой эндпоинт
export const getBoardState = (roomId) => apiClient.get(`/rooms/${roomId}/board`);
export const getJitsiToken = (roomId) => apiClient.get(`/rooms/${roomId}/voice-chat`);
export const leaveRoom = (roomId) => apiClient.post(`/rooms/${roomId}/leave`);
export const sendRoomInvite = (roomId, username, code) =>
    apiClient.post(`/rooms/${roomId}/send-invite`, { username, code });
export const getInviteLink = (roomId) => apiClient.get(`/rooms/${roomId}/invite-link`);
export const joinRoomByToken = (token) => apiClient.post(`/rooms/join/${token}`);
export const deleteMessage = (messageId) => apiClient.delete(`/rooms/messages/${messageId}`)
export const pinMessage = (roomId, messageId) => apiClient.post(`/rooms/messages/${roomId}/${messageId}/pin`)
export const unpinMessage = (roomId) => apiClient.delete(`/rooms/${roomId}/pinned-message`);
export const getPinnedMessage = (roomId) => apiClient.get(`rooms/${roomId}/pinned-message`);
export const appointAdmin = (roomId, userId) => 
    apiClient.post(`/rooms/${roomId}/admin`, { userId });

export const removeParticipant = (roomId, userId) => 
    apiClient.delete(`/rooms/${roomId}/participants/${userId}`);