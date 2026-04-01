import apiClient from './client';

export const getRooms = () => apiClient.get('/rooms');
export const createRoom = (name, icon) => apiClient.post('/rooms/create', { name, icon })