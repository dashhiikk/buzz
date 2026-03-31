import apiClient from './client';

export const getRooms = () => apiClient.get('/rooms');