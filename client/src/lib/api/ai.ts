import axiosInstance from './axios';

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
	createdAt: string;
}

export interface ChatResponse {
	chatId: string;
	createdAt: string;
	label: string;
}

export interface AskResponse {
	success: boolean;
	chatLabel: string | null;
}

export interface Model {
	id: number;
	name: string;
	maxInputToken: number;
	providerName: string;
	providerId: number;
}

export const aiApi = {
	getModels: async () => {
		const response = await axiosInstance.get<Model[]>('/ai-models');
		return response.data;
	},

	createChat: async () => {
		const response = await axiosInstance.post<ChatResponse>('/chat');
		return response.data;
	},

	sendMessage: async (chatId: string, prompt: string, aiModelId: number) => {
		const response = await axiosInstance.post<AskResponse>(`/chat/${chatId}`, {
			prompt,
			aiModelId,
		});
		return response.data;
	},

	getChats: async (offset: number = 0, limit: number = 20) => {
		const response = await axiosInstance.get<ChatResponse[]>(
			`/chat?offset=${offset}&limit=${limit}`
		);
		return response.data;
	},

	getChatMessages: async (chatId: string) => {
		const response = await axiosInstance.get<ChatMessage[]>(`/chat/${chatId}`);
		return response.data;
	},
};
