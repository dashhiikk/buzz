import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',        // через прокси Vite будет перенаправляться на http://localhost:8080
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор запроса: добавляем токен авторизации в заголовок
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор ответа: при 401 (неавторизован) очищаем токен и перенаправляем на страницу входа
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Если не на странице входа, перенаправляем
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;