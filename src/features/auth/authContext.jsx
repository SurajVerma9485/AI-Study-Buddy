import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './authService';
import { getAccessToken, clearTokens } from '../../services/api';
import { clearUserSessionAndCache } from '../../services/storageHelper';
import { MOCK_USER } from '../../services/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('study_buddy_user');
      const token = getAccessToken();
      // If user data and token exist, restore session
      return stored && token ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync user state changes with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('study_buddy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('study_buddy_user');
    }
  }, [user]);

  const clearError = () => setError(null);

  const login = async (credentials, maybePassword) => {
    setIsLoading(true);
    setError(null);
    const creds = typeof credentials === 'string' ? { email: credentials, password: maybePassword } : credentials;
    try {
      const { user: loggedInUser } = await authService.login(creds);
      // Clean up previous user temporary cache if user switched
      if (user && user.id !== loggedInUser.id) {
        clearUserSessionAndCache(user.id);
      }
      setUser(loggedInUser);
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent('study_buddy_user_changed', { detail: { userId: loggedInUser.id } }));
      return loggedInUser;
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Login failed.');
      throw err;
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: registeredUser } = await authService.register(userData);
      if (user && user.id !== registeredUser.id) {
        clearUserSessionAndCache(user.id);
      }
      setUser(registeredUser);
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent('study_buddy_user_changed', { detail: { userId: registeredUser.id } }));
      return registeredUser;
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const prevUserId = user?.id;
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout error', err);
    } finally {
      clearUserSessionAndCache(prevUserId);
      clearTokens();
      setUser(null);
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent('study_buddy_user_changed', { detail: { userId: null } }));
    }
  };

  const loginAsDemo = async () => {
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 400));
    const demoUser = { ...MOCK_USER, id: '00000000-0000-0000-0000-000000000001' };
    if (user && user.id !== demoUser.id) {
      clearUserSessionAndCache(user.id);
    }
    setUser(demoUser);
    localStorage.setItem('study_buddy_access_token', 'demo-access-token-12345');
    setIsLoading(false);
    window.dispatchEvent(new CustomEvent('study_buddy_user_changed', { detail: { userId: demoUser.id } }));
    return demoUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        clearError,
        login,
        register,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
