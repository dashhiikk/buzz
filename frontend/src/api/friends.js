import apiClient from './client';

export const getFriends = () => apiClient.get('/friends');