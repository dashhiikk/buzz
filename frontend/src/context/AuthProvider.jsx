import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { AuthContext } from './AuthContext';
import { updateProfile } from '../api/users'
import clearSessionState from '../hooks/clear-session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  const openRegistrationModal = () => setShowRegistrationModal(true);
  const openRecoveryModal = () => setShowRecoveryModal(true);
  const closeModals = () => {
    setShowRegistrationModal(false);
    setShowRecoveryModal(false);
  };
  
  const setAuthToken = (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };

  const fetchUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Проверка авторизации при загрузке приложения
  useEffect(() => {
    setLoading(false);
  }, []);

  // Вход
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken } = response.data;
      setAuthToken(accessToken);
      await fetchUser();
      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Извлекаем сообщение об ошибке из ответа сервера или используем стандартное
      const message = error.response?.data?.error || error.message || 'Ошибка входа';
      throw new Error(message);
    }
  };

  // Регистрация
  const register = async (username, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
      return response;
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.error || error.message || 'Ошибка регистрации';
      throw new Error(message);
    }
  };
  
  // Верификация почты
  const verifyEmail = async (token) => {
    try {
      const response = await apiClient.get(`/auth/verify?token=${token}`);
      const { accessToken } = response.data;
      if (!accessToken) throw new Error('Токен не получен');
      // сохраняем JWT
      setAuthToken(accessToken);

      // получаем пользователя
      await fetchUser();

      return true;
    } catch (error) {
      console.error('Verify error:', error);
      const message = error.response?.data?.error || error.message || 'Ошибка подтверждения';
      throw new Error(message);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await apiClient.post('/auth/password-reset', { email });
      return response;
    } catch (error) {
      console.error('Password reset request error:', error);
      const message = error.response?.data?.error || error.message || 'Ошибка сброса пароля';
      throw new Error(message);
    }
    };

    const updatePassword = async (token, newPassword) => {
    try {
      const response = await apiClient.post('/auth/update-password', { token, newPassword });
      const { accessToken } = response.data;
      setAuthToken(accessToken);
      await fetchUser();
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      const message = error.response?.data?.error || error.message || 'Ошибка смены пароля';
      throw new Error(message);
    }
    };

  // Выход
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      clearSessionState();
      setUser(null);
    }
  };

  const updateUser = async (data) => {
    try {
      const response = await updateProfile(data);
      setUser(prev => ({ ...prev, ...data }));
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      verifyEmail, 
      requestPasswordReset, 
      updatePassword,  
      logout,
      updateUser,
      showRegistrationModal,
      showRecoveryModal,
      openRegistrationModal,
      openRecoveryModal,
      closeModals 
    }}>
      {children}
    </AuthContext.Provider>
  );
};