import { User } from '../types/api';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const storage = {
	getToken: (): string | null => {
		return localStorage.getItem(TOKEN_KEY);
	},

	setToken: (token: string): void => {
		localStorage.setItem(TOKEN_KEY, token);
	},

	removeToken: (): void => {
		localStorage.removeItem(TOKEN_KEY);
	},

	getRefreshToken: (): string | null => {
		return localStorage.getItem(REFRESH_TOKEN_KEY);
	},

	setRefreshToken: (token: string): void => {
		localStorage.setItem(REFRESH_TOKEN_KEY, token);
	},

	removeRefreshToken: (): void => {
		localStorage.removeItem(REFRESH_TOKEN_KEY);
	},

	getUser: (): User | null => {
		const user = localStorage.getItem(USER_KEY);
		return user ? JSON.parse(user) : null;
	},

	setUser: (user: User): void => {
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	},

	removeUser: (): void => {
		localStorage.removeItem(USER_KEY);
	},

	clear: (): void => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(REFRESH_TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
	},
};
