import api, { setAccessToken } from './api';

/**
 * Register a new user
 * @param {Object} userData { name, username, email, password, role }
 */
export async function register(userData) {
  try {
    const response = await api.post('/api/auth/register', userData);
    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  } catch (error) {

    const message = error.response?.data?.message || error.message || 'Registration failed';
    throw new Error(message);
  }
}

/**
 * Log in a user using email or username
 * @param {Object} credentials { identifier, password }
 */
export async function login({ identifier, password }) {
  try {
    const response = await api.post('/api/auth/login', {
      identifier: identifier.trim(),
      password,
    });
    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  } catch (error) {


    const message = error.response?.data?.message || error.message || 'Login failed';
    const err = new Error(message);
    err.status = error.response?.status;
    throw err;
  }
}

/**
 * Social OAuth login (Google / Facebook)
 * @param {Object} socialData { provider, email, name, avatar, role }
 */
export async function socialLogin(socialData) {
  try {
    const response = await api.post('/api/auth/social-login', socialData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Social login failed';
    throw new Error(message);
  }
}

/**
 * Verify user email via 6-digit OTP
 * @param {Object} data { otp, email }
 */
export async function verifyEmail({ otp, email }) {
  try {
    const response = await api.post('/api/auth/verify-email', { otp, email });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'OTP verification failed';
    throw new Error(message);
  }
}

/**
 * Resend email verification OTP
 * @param {Object} data { email }
 */
export async function resendOTP({ email } = {}) {
  try {
    const response = await api.post('/api/auth/resend-otp', { email });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to resend OTP';
    throw new Error(message);
  }
}

/**
 * Log out user
 */
export async function logout() {
  try {
    const response = await api.get('/api/auth/logout');
    return response.data;
  } catch (error) {
    console.warn('Logout error:', error);
  } finally {
    setAccessToken(null);
    localStorage.removeItem('collabo_user');
    localStorage.setItem('collabo_auth', 'false');
  }
}

