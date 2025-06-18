export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
}

export interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	currentUser: User;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials extends LoginCredentials {
	firstName: string;
	lastName: string;
}

export interface Message {
	id: string;
	content: string;
	sender: 'user' | 'ai';
	timestamp: string;
	attachments?: Array<{
		type: 'image' | 'document' | 'link';
		url: string;
		name: string;
	}>;
}
