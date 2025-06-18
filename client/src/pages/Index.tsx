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
import { useNavigate, useParams } from 'react-router-dom';

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
	const [streamingResponse, setStreamingResponse] = useState('');
	const [displayedResponse, setDisplayedResponse] = useState('');
	const [isStreaming, setIsStreaming] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const { chatId: urlChatId } = useParams();

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

	// Append streaming message if streaming
	const allMessages = [...messages];
	if (isStreaming && displayedResponse) {
		allMessages.push({
			id: 'streaming',
			content: displayedResponse,
			sender: 'ai',
			timestamp: new Date().toLocaleTimeString(),
		});
	}

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

	// Sync currentChatId with URL
	useEffect(() => {
		if (urlChatId && urlChatId !== currentChatId) {
			setCurrentChatId(urlChatId);
		}
	}, [urlChatId]);

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
			navigate(`/${response.chatId}`);
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
		navigate(`/${chatId}`);
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
					ref={sidebarRef}
					onScroll={handleSidebarScroll}
					isLoggedIn={isLoggedIn}
					onLogin={() => setShowLoginModal(true)}
					onLogout={handleLogout}
					currentUser={currentUser}
				/>
				<div className="flex flex-col flex-1 h-full">
					<div className="flex-1 overflow-y-auto">
						<ScrollArea className="h-full px-4 py-6">
							{allMessages.map((msg) => (
								<ChatMessage key={msg.id} message={msg} />
							))}
							<div ref={messagesEndRef} />
						</ScrollArea>
					</div>
					<ChatInput
						onChatCreated={(chatId, label) => {
							setCurrentChatId(chatId);
							navigate(`/${chatId}`);
						}}
						disabled={!isLoggedIn}
						onStreamingResponse={setStreamingResponse}
						onDisplayedResponse={setDisplayedResponse}
						onStreamingStatus={setIsStreaming}
					/>
				</div>
			</div>
		</ThemeProvider>
	);
};

export default Index;
