import apiClient from './client';

export const getIncomingRequests = () => apiClient.get('/requests/');
export const getOutgoingRequests = () => apiClient.get('/requests/outgoing');
export const cancelRequest = (requestId) => apiClient.delete(`/requests/${requestId}`);