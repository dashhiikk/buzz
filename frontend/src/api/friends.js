import apiClient from './client';

export const getFriends = () => apiClient.get('/friends');
export const sendFriendRequest = (username, code) =>
    apiClient.post('/friends/send-request', { username, code });