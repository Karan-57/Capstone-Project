import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Pure In-Memory Access Token Storage (Guards against XSS extraction)
let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
    inMemoryAccessToken = token || null;
};

export const getAccessToken = () => inMemoryAccessToken;

// Singleton in-flight refresh promise to prevent duplicate concurrent refresh requests
let refreshPromise = null;

export const refreshAccessToken = async () => {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const { data } = await api.get('/api/auth/refresh-token');
            const newAccessToken = data?.accessToken;
            if (!newAccessToken) {
                throw new Error('No access token returned from refresh');
            }
            setAccessToken(newAccessToken);
            return data;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

// Request interceptor: Attach JWT token from memory if present, awaiting active refresh on page reloads
api.interceptors.request.use(
    async (config) => {
        // Skip auth routes from waiting on refresh
        const isAuthRoute =
            config.url?.includes('/api/auth/login') ||
            config.url?.includes('/api/auth/register') ||
            config.url?.includes('/api/auth/refresh-token');

        if (!isAuthRoute) {
            // If a refresh is currently in-flight, await it so this request doesn't fire unauthenticated
            if (refreshPromise) {
                try {
                    await refreshPromise;
                } catch (e) {
                    // Let request proceed and fail naturally
                }
            } else if (!inMemoryAccessToken && localStorage.getItem('collabo_auth') === 'true') {
                // User is authenticated but memory was wiped (e.g. F5 page reload); fetch token first
                try {
                    await refreshAccessToken();
                } catch (e) {
                    // Handled by response interceptor
                }
            }
        }

        if (inMemoryAccessToken) {
            config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Transparently refresh expired access token on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is not 401, or the request was already retried, or was an auth attempt itself
        if (
            !error.response ||
            error.response.status !== 401 ||
            originalRequest._retry ||
            originalRequest.url?.includes('/api/auth/login') ||
            originalRequest.url?.includes('/api/auth/register') ||
            originalRequest.url?.includes('/api/auth/refresh-token')
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const data = await refreshAccessToken();
            const newAccessToken = data?.accessToken;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            setAccessToken(null);

            // Refresh token has expired or been revoked — full logout required
            localStorage.removeItem('collabo_auth');
            localStorage.removeItem('collabo_user');

            return Promise.reject(refreshError);
        }
    }
);

export const getApiStatus = async() => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('API connection error:', error);
        return null;
    }
};

export default api;