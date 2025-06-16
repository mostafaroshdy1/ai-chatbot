import axios, {
	AxiosError,
	AxiosInstance,
	InternalAxiosRequestConfig,
	AxiosResponse,
} from 'axios';
import { storage } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:4444';

// Extend the InternalAxiosRequestConfig to include _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000, // 10 seconds
});

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve();
		}
	});
	failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = storage.getToken();
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

// Response interceptor
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as CustomAxiosRequestConfig;

		if (error.response?.status === 401 && originalRequest) {
			if (isRefreshing) {
				// If token refresh is in progress, add request to queue
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => {
						return axiosInstance(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const refreshToken = storage.getRefreshToken();
				if (!refreshToken) {
					throw new Error('No refresh token available');
				}

				const response = await axios.post(`${BASE_URL}/auth/refresh`, {
					refreshToken,
				});

				const { accessToken, refreshToken: newRefreshToken } = response.data;
				storage.setToken(accessToken);
				storage.setRefreshToken(newRefreshToken);

				// Update the failed request's authorization header
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${accessToken}`;
				}

				processQueue();
				return axiosInstance(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError);
				// Clear storage and redirect to login
				storage.clear();
				window.location.href = '/login';
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);

export default axiosInstance;
