import axiosInstance from './axios';
import {
	AuthResponse,
	LoginCredentials,
	RegisterCredentials,
} from '../types/api';
import { storage } from '../utils/storage';

export const authApi = {
	login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
		const response = await axiosInstance.post<AuthResponse>(
			'/auth/login',
			credentials
		);
		const { accessToken, refreshToken, currentUser } = response.data;
		storage.setToken(accessToken);
		storage.setRefreshToken(refreshToken);
		storage.setUser(currentUser);
		return response.data;
	},

	register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
		const response = await axiosInstance.post<AuthResponse>(
			'user',
			credentials
		);
		const { accessToken, refreshToken, currentUser } = response.data;
		storage.setToken(accessToken);
		storage.setRefreshToken(refreshToken);
		storage.setUser(currentUser);
		return response.data;
	},

	logout: async (): Promise<void> => {
		storage.clear();
	},

	getCurrentUser: async (): Promise<AuthResponse> => {
		const response = await axiosInstance.get<AuthResponse>('/auth/me');
		const { accessToken, refreshToken, currentUser } = response.data;
		storage.setToken(accessToken);
		storage.setRefreshToken(refreshToken);
		storage.setUser(currentUser);
		return response.data;
	},

	refreshToken: async (): Promise<AuthResponse> => {
		const response = await axiosInstance.post<AuthResponse>('/auth/refresh');
		const { accessToken, refreshToken, currentUser } = response.data;
		storage.setToken(accessToken);
		storage.setRefreshToken(refreshToken);
		storage.setUser(currentUser);
		return response.data;
	},
};
