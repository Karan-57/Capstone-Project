import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
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

// Request interceptor: Attach JWT token from memory if present
api.interceptors.request.use(
    (config) => {
        if (inMemoryAccessToken) {
            config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


// Track refresh state to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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

        if (isRefreshing) {
            // Queue any subsequent concurrent requests while refresh is in-flight
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Backend endpoint GET /api/auth/refresh-token reads the HTTP-only refreshToken cookie
            const { data } = await api.get('/api/auth/refresh-token');
            const newAccessToken = data?.accessToken;

            if (!newAccessToken) {
                throw new Error('No access token returned from refresh');
            }

            // Save new token in memory only
            setAccessToken(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            setAccessToken(null);

            // Refresh token has also expired or been revoked — full logout required
            localStorage.setItem('collabo_auth', 'false');
            localStorage.removeItem('collabo_user');

            if (
                typeof window !== 'undefined' &&
                window.location.pathname !== '/login' &&
                !window.location.pathname.startsWith('/auth/')
            ) {
                window.location.href = '/login';
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
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