import apiClient from './client';

export const updateProfile = (data) => apiClient.patch('/users/me', data);
export const changePassword = (oldPassword, newPassword) => apiClient.post('/auth/change-password', { oldPassword, newPassword });
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return apiClient.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};