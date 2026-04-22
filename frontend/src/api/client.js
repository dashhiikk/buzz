import axios from 'axios';
import { tokenManager } from '../context/tokenManager';

const apiClient = axios.create({
  baseURL: '/api',        // через прокси Vite будет перенаправляться на http://localhost:8080
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор запроса: добавляем токен авторизации в заголовок
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
);


// Перехватчик ответов для обработки 401
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await apiClient.post('/auth/refresh');
        const { accessToken } = response.data;
        // Сохраняем новый токен в памяти и в defaults
        // Для этого нужно иметь доступ к функции setAuthToken – можно передать через контекст или событие.
        // Проще: вызвать глобальное событие или хранить токен в отдельном модуле.
        // Вот упрощённый вариант: используем отдельный модуль tokenManager
        tokenManager.setToken(accessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenManager.clearToken();
        window.location.href = '/entry';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;