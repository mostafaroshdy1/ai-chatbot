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

interface Chat {
	id: string;
	label: string;
	createdAt: string;
	isTemp?: boolean;
}

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
	const [chats, setChats] = useState<Chat[]>([]);
	const [messagesByChatId, setMessagesByChatId] = useState<
		Record<string, Message[]>
	>({});
	const [selectedQuestion, setSelectedQuestion] = useState<string>('');
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const { chatId: urlChatId } = useParams();

	// Sync currentChatId with URL
	useEffect(() => {
		if (urlChatId && urlChatId !== currentChatId) {
			setCurrentChatId(urlChatId);

			// Fetch messages for the chat if it's not a temp chat
			const selectedChat = chats.find((chat) => chat.id === urlChatId);
			if (selectedChat && !selectedChat.isTemp) {
				const fetchMessages = async () => {
					try {
						const messages = await aiApi.getChatMessages(urlChatId);
						const formattedMessages: Message[] = messages.map((msg) => ({
							id: msg.createdAt,
							content: msg.content,
							sender: msg.role === 'user' ? 'user' : 'ai',
							timestamp: msg.createdAt,
						}));
						setMessagesByChatId((prev) => ({
							...prev,
							[urlChatId]: formattedMessages,
						}));
					} catch (error) {
						console.error('Error fetching messages:', error);
						toast({
							title: 'Error',
							description: 'Failed to load chat messages',
							variant: 'destructive',
						});
					}
				};
				fetchMessages();
			}
		}
	}, [urlChatId, currentChatId, chats]);

	// Scroll to bottom on messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [currentChatId, messagesByChatId]);

	// On mount, fetch chats from server (for real chats)
	useEffect(() => {
		const fetchChats = async () => {
			const serverChats = await aiApi.getChats(0);
			setChats(
				serverChats.map((chat) => ({
					id: chat.chatId,
					label: chat.label,
					createdAt: chat.createdAt,
					isTemp: false,
				}))
			);
		};
		fetchChats();
	}, []);

	// On chat select
	const handleChatSelect = async (chatId: string) => {
		setCurrentChatId(chatId);
		navigate(`/${chatId}`);

		// Fetch messages for the selected chat if it's not a temp chat
		const selectedChat = chats.find((chat) => chat.id === chatId);
		if (selectedChat && !selectedChat.isTemp) {
			try {
				const messages = await aiApi.getChatMessages(chatId);
				const formattedMessages: Message[] = messages.map((msg) => ({
					id: msg.createdAt, // Using timestamp as ID since API doesn't provide message ID
					content: msg.content,
					sender: msg.role === 'user' ? 'user' : 'ai',
					timestamp: msg.createdAt,
				}));
				setMessagesByChatId((prev) => ({
					...prev,
					[chatId]: formattedMessages,
				}));
			} catch (error) {
				console.error('Error fetching messages:', error);
				toast({
					title: 'Error',
					description: 'Failed to load chat messages',
					variant: 'destructive',
				});
			}
		}
	};

	// On new chat (create temp chat)
	const handleNewChat = () => {
		const tempId = `temp-${Date.now()}`;
		const tempChat = {
			id: tempId,
			label: 'New Chat',
			createdAt: new Date().toISOString(),
			isTemp: true,
		};
		setChats((prev) => [tempChat, ...prev]);
		setMessagesByChatId((prev) => ({ ...prev, [tempId]: [] }));
		setCurrentChatId(tempId);
		navigate(`/${tempId}`);
	};

	// On first message, replace temp chat with real chat
	const handleFirstMessage = (oldId: string, newId: string, label: string) => {
		setChats((prev) => {
			// If oldId and newId are the same, it's a chat rename
			if (oldId === newId) {
				return prev.map((chat) =>
					chat.id === oldId ? { ...chat, label } : chat
				);
			}
			// Otherwise, it's a temp chat being replaced
			return prev.map((chat) =>
				chat.id === oldId ? { ...chat, id: newId, label, isTemp: false } : chat
			);
		});

		// Only update messages if it's a different chat ID
		if (oldId !== newId) {
			setMessagesByChatId((prev) => {
				const messages = prev[oldId] || [];
				const { [oldId]: _, ...rest } = prev;
				return { ...rest, [newId]: messages };
			});
			setCurrentChatId(newId);
			navigate(`/${newId}`);
		}
	};

	// Add message to current chat
	const addMessage = (chatId: string, msg: Message) => {
		setMessagesByChatId((prev) => {
			const updated = {
				...prev,
				[chatId]: [...(prev[chatId] || []), msg],
			};
			return updated;
		});
	};

	// Update existing message in current chat
	const updateMessage = (
		chatId: string,
		messageId: string,
		newContent: string
	) => {
		setMessagesByChatId((prev) => {
			const chatMessages = prev[chatId] || [];
			const updatedMessages = chatMessages.map((msg) =>
				msg.id === messageId ? { ...msg, content: newContent } : msg
			);
			return {
				...prev,
				[chatId]: updatedMessages,
			};
		});
	};

	// Messages for current chat
	const messages = currentChatId ? messagesByChatId[currentChatId] || [] : [];

	useEffect(() => {
		// Check for existing session
		const token = storage.getToken();
		const user = storage.getUser();
		if (token && user) {
			setIsLoggedIn(true);
			setCurrentUser(user);
		}
	}, []);

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
		setSelectedQuestion(question);
	};

	const handleQuestionProcessed = () => {
		setSelectedQuestion('');
	};

	// Test function to add a message manually
	const addTestMessage = () => {
		if (currentChatId) {
			const testMsg: Message = {
				id: Date.now().toString(),
				content:
					'This is a test AI message to verify the chat display is working.',
				sender: 'ai',
				timestamp: new Date().toLocaleTimeString(),
			};
			addMessage(currentChatId, testMsg);
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
						id: chat.id,
						title: chat.label || 'New Chat',
						timestamp: new Date(chat.createdAt).toLocaleString(),
					}))}
					onChatSelect={handleChatSelect}
					selectedChatId={currentChatId}
					ref={sidebarRef}
					onScroll={() => {}}
					isLoggedIn={isLoggedIn}
					onLogin={() => setShowLoginModal(true)}
					onLogout={handleLogout}
					currentUser={currentUser}
				/>
				<div className="flex flex-col flex-1 h-full">
					<div className="flex-1 overflow-y-auto">
						<ScrollArea className="h-full px-4 py-6">
							{messages.length > 0 ? (
								messages.map((msg) => (
									<ChatMessage key={msg.id} message={msg} />
								))
							) : (
								<DefaultQuestions onQuestionSelect={handleQuestionSelect} />
							)}
							<div ref={messagesEndRef} />
						</ScrollArea>
					</div>
					<ChatInput
						currentChatId={currentChatId}
						isTempChat={chats.find((c) => c.id === currentChatId)?.isTemp}
						onFirstMessage={handleFirstMessage}
						addMessage={addMessage}
						updateMessage={updateMessage}
						disabled={!isLoggedIn}
						selectedQuestion={selectedQuestion}
						onStreamingResponse={setStreamingResponse}
						onDisplayedResponse={setDisplayedResponse}
						onStreamingStatus={setIsStreaming}
						onQuestionProcessed={handleQuestionProcessed}
					/>
				</div>
			</div>
			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
				onLogin={handleLogin}
			/>
		</ThemeProvider>
	);
};

export default Index;
