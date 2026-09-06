import apiClient, {
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
  clearTokens,
} from '../../services/api';

const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

/**
 * Authentication Service
 * Communicates with backend endpoints:
 * - POST /api/v1/auth/register
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/refresh
 * - POST /api/v1/auth/logout
 */
export const authService = {
  /**
   * Register a new student
   */
  async register({ name, email, password }) {
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;
      if (accessToken) setAccessToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);

      return { user, accessToken, refreshToken };
    } catch (error) {
      // If backend is not online and mock fallback is allowed for UI demo
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        console.warn('Backend offline. Utilizing simulated auth response for UI verification.');
        await new Promise((r) => setTimeout(r, 600));

        const simulatedUser = {
          id: `usr-${Date.now()}`,
          name,
          email,
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          studyStreakDays: 1,
        };
        const simulatedAccessToken = `jwt-access-token-${Date.now()}`;
        const simulatedRefreshToken = `jwt-refresh-token-${Date.now()}`;

        setAccessToken(simulatedAccessToken);
        setRefreshToken(simulatedRefreshToken);
        return { user: simulatedUser, accessToken: simulatedAccessToken, refreshToken: simulatedRefreshToken };
      }

      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Login student
   */
  async login({ email, password }) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;
      if (accessToken) setAccessToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);

      return { user, accessToken, refreshToken };
    } catch (error) {
      // If backend is not online and mock fallback is allowed for UI demo
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        console.warn('Backend offline. Utilizing simulated auth response for UI verification.');
        await new Promise((r) => setTimeout(r, 600));

        const simulatedUser = {
          id: 'usr_001',
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Student',
          email,
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          studyStreakDays: 14,
        };
        const simulatedAccessToken = `jwt-access-token-${Date.now()}`;
        const simulatedRefreshToken = `jwt-refresh-token-${Date.now()}`;

        setAccessToken(simulatedAccessToken);
        setRefreshToken(simulatedRefreshToken);
        return { user: simulatedUser, accessToken: simulatedAccessToken, refreshToken: simulatedRefreshToken };
      }

      const errorMessage = error.response?.data?.message || error.message || 'Invalid email or password.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Refresh JWT token
   */
  async refresh() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token found');

    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
      setAccessToken(newAccessToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      clearTokens();
      throw new Error('Session expired. Please log in again.');
    }
  },

  /**
   * Logout student
   */
  async logout() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.warn('Logout endpoint notification failed', err);
    } finally {
      clearTokens();
    }
  },

  /**
   * Request password reset token / email (Placeholder)
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 600));
        return { message: 'Reset instructions sent to your email address.' };
      }
      throw new Error(error.response?.data?.message || 'Password reset request failed.');
    }
  },
};

export default authService;
