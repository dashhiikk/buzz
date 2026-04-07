import apiClient from './client';

export const getIncomingRequests = () => apiClient.get('/requests/');
export const getOutgoingRequests = () => apiClient.get('/requests/outgoing');
export const cancelRequest = (requestId) => apiClient.delete(`/requests/${requestId}`);
export const acceptRequest = (requestId) => apiClient.post(`/requests/${requestId}/accept`)
export const rejectRequest = (requestId) => apiClient.post(`/requests/${requestId}/reject`)