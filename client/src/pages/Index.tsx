import React, { useState, useRef, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import DefaultQuestions from '@/components/DefaultQuestions';
import ChatInput from '@/components/ChatInput';
import LoginModal from '@/components/LoginModal';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authApi } from '@/lib/api/auth';
import { storage } from '@/lib/utils/storage';
import { User } from '@/lib/types/api';
import { aiApi } from '@/lib/api/ai';
import { toast } from '@/components/ui/use-toast';

interface Message {
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

const Index = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [currentChatId, setCurrentChatId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const sidebarRef = useRef<HTMLDivElement>(null);

	// Fetch chats with infinite scroll
	const {
		data: chatsData,
		fetchNextPage: fetchNextChats,
		hasNextPage: hasMoreChats,
		isFetchingNextPage: isFetchingMoreChats,
	} = useInfiniteQuery({
		queryKey: ['chats'],
		queryFn: ({ pageParam = 0 }) => aiApi.getChats(pageParam),
		getNextPageParam: (lastPage, allPages) => {
			// If we got less than 20 items, we've reached the end
			return lastPage.length < 20 ? undefined : allPages.length * 20;
		},
		initialPageParam: 0,
	});

	// Fetch messages for current chat
	const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
		queryKey: ['messages', currentChatId],
		queryFn: () => aiApi.getChatMessages(currentChatId!),
		enabled: !!currentChatId,
	});

	// Flatten chats data
	const chats = chatsData?.pages.flatMap((page) => page) || [];

	// Sort messages data
	const messages =
		messagesData
			?.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			)
			.map((msg) => ({
				id: msg.createdAt,
				content: msg.content,
				sender: msg.role === 'assistant' ? ('ai' as const) : ('user' as const),
				timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				}),
			})) || [];

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		// Check for existing session
		const token = storage.getToken();
		const user = storage.getUser();
		if (token && user) {
			setIsLoggedIn(true);
			setCurrentUser(user);
		}
	}, []);

	// Handle sidebar scroll for infinite loading
	const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		if (
			scrollHeight - scrollTop <= clientHeight * 1.5 &&
			hasMoreChats &&
			!isFetchingMoreChats
		) {
			fetchNextChats();
		}
	};

	const handleNewChat = async () => {
		try {
			const response = await aiApi.createChat();
			setCurrentChatId(response.chatId);
		} catch (error) {
			console.error('Failed to create new chat:', error);
			toast({
				title: 'Error',
				description: 'Failed to create new chat',
				variant: 'destructive',
			});
		}
	};

	const handleChatSelect = (chatId: string) => {
		setCurrentChatId(chatId);
	};

	const handleLogin = async (email: string, password: string) => {
		try {
			const response = await authApi.login({ email, password });
			setIsLoggedIn(true);
			setCurrentUser(response.currentUser);
		} catch (error) {
			console.error('Login failed:', error);
		}
	};

	const handleLogout = async () => {
		try {
			await authApi.logout();
			setIsLoggedIn(false);
			setCurrentUser(null);
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	const handleQuestionSelect = (question: string) => {
		if (!currentChatId) {
			handleNewChat();
		}
		// Wait for next tick to ensure currentChatId is set
		setTimeout(() => {
			handleSendMessage(question);
		}, 0);
	};

	const handleSendMessage = async (content: string, attachments?: File[]) => {
		if (!currentChatId) {
			handleNewChat();
			// Wait for the new chat to be created
			setTimeout(() => {
				handleSendMessage(content, attachments);
			}, 0);
			return;
		}

		setIsLoading(true);

		try {
			const selectedModelData = await aiApi.getModels();
			if (!selectedModelData.length) throw new Error('No models available');

			await aiApi.sendMessage(currentChatId, content, selectedModelData[0].id);
		} catch (error) {
			console.error('Error sending message:', error);
			toast({
				title: 'Error',
				description:
					error instanceof Error ? error.message : 'Failed to send message',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ThemeProvider defaultTheme="system" storageKey="t3-chat-theme">
			<div className="flex h-screen bg-gray-50 dark:bg-gray-900">
				<Sidebar
					isCollapsed={sidebarCollapsed}
					onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
					onNewChat={handleNewChat}
					chats={chats.map((chat) => ({
						id: chat.chatId,
						title: chat.label || 'New Chat',
						timestamp: new Date(chat.createdAt).toLocaleString(),
					}))}
					onChatSelect={handleChatSelect}
					selectedChatId={currentChatId}
					isLoggedIn={isLoggedIn}
					onLogin={() => setShowLoginModal(true)}
					onLogout={handleLogout}
					currentUser={currentUser}
					onScroll={handleSidebarScroll}
					ref={sidebarRef}
				/>

				<div className="flex-1 flex flex-col">
					{messages.length === 0 && !currentChatId ? (
						<div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
							<DefaultQuestions onQuestionSelect={handleQuestionSelect} />
						</div>
					) : (
						<ScrollArea className="flex-1 bg-white dark:bg-gray-900">
							<div className="max-w-4xl mx-auto">
								{isLoadingMessages && (
									<div className="flex justify-center p-4">
										<div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
									</div>
								)}
								{messages.map((message) => (
									<ChatMessage key={message.id} message={message} />
								))}
								{isLoading && (
									<div className="flex gap-4 p-6 bg-gray-50 dark:bg-gray-800">
										<div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
											<div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
										</div>
										<div className="flex-1">
											<div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">
												Assistant
											</div>
											<div className="text-gray-600 dark:text-gray-400">
												Thinking...
											</div>
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>
						</ScrollArea>
					)}

					<ChatInput
						disabled={isLoading}
						onChatCreated={(chatId, label) => {
							setCurrentChatId(chatId);
						}}
					/>
				</div>

				<LoginModal
					isOpen={showLoginModal}
					onClose={() => setShowLoginModal(false)}
					onLogin={handleLogin}
				/>
			</div>
		</ThemeProvider>
	);
};

export default Index;
