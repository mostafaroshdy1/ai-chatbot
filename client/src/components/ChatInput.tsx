import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Search, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { aiApi, Model } from '@/lib/api/ai';
import { useToast } from '@/components/ui/use-toast';
import { useSSE } from '@/lib/hooks/useSSE';
import ChatMessage from './ChatMessage';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/lib/types/api';

interface ChatInputProps {
	currentChatId: string | null;
	isTempChat: boolean;
	onFirstMessage: (oldId: string, newId: string, label: string) => void;
	addMessage: (chatId: string, msg: Message) => void;
	updateMessage: (
		chatId: string,
		messageId: string,
		newContent: string
	) => void;
	disabled?: boolean;
	onStreamingResponse?: (response: string) => void;
	onDisplayedResponse?: (response: string) => void;
	onStreamingStatus?: (isStreaming: boolean) => void;
	selectedQuestion?: string;
	onQuestionProcessed?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
	currentChatId,
	isTempChat,
	onFirstMessage,
	addMessage,
	updateMessage,
	disabled = false,
	onStreamingResponse,
	onDisplayedResponse,
	onStreamingStatus,
	selectedQuestion,
	onQuestionProcessed,
}) => {
	const { chatId: urlChatId } = useParams();
	const [message, setMessage] = useState('');
	const [models, setModels] = useState<Model[]>([]);
	const [selectedModel, setSelectedModel] = useState<string>('');
	const [isLoadingModels, setIsLoadingModels] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [attachments, setAttachments] = useState<File[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();
	const [localStreamingResponse, setLocalStreamingResponse] = useState('');
	const streamingResponseRef = useRef('');
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const currentChatIdRef = useRef<string | null>(null);
	const aiMessageIdRef = useRef<string | null>(null);

	const { connect, disconnect } = useSSE({
		onMessage: (chunk) => {
			onStreamingStatus?.(true);

			// If this is the first chunk, create the AI message
			if (!aiMessageIdRef.current) {
				const chatIdToUse = currentChatIdRef.current || currentChatId;
				if (chatIdToUse) {
					const aiMsg: Message = {
						id: Date.now().toString(),
						content: '',
						sender: 'ai',
						timestamp: new Date().toLocaleTimeString(),
					};
					aiMessageIdRef.current = aiMsg.id;
					addMessage(chatIdToUse, aiMsg);
				}
			}

			setLocalStreamingResponse((prev) => {
				const updated = prev + chunk;
				streamingResponseRef.current = updated; // Store in ref
				onStreamingResponse?.(updated);

				// Update the AI message content as it streams
				if (aiMessageIdRef.current) {
					const chatIdToUse = currentChatIdRef.current || currentChatId;
					if (chatIdToUse) {
						updateMessage(chatIdToUse, aiMessageIdRef.current, updated);
					}
				}

				return updated;
			});
		},
		onComplete: () => {
			// Clear timeouts since SSE completed successfully
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			if (fallbackTimeoutRef.current) {
				clearTimeout(fallbackTimeoutRef.current);
				fallbackTimeoutRef.current = null;
			}

			setIsSending(false);
			onStreamingStatus?.(false);

			// Clear streaming response after completion
			setLocalStreamingResponse('');
			streamingResponseRef.current = '';
			onStreamingResponse?.('');
			onDisplayedResponse?.('');

			// Reset AI message ID for next conversation
			aiMessageIdRef.current = null;
		},
		onError: (err) => {
			if (err.message === 'Max retry attempts reached') {
				toast({
					title: 'Connection Error',
					description: 'Unable to establish connection. Please try again.',
					variant: 'destructive',
				});
			}
			setIsSending(false);
			onStreamingStatus?.(false);
			setLocalStreamingResponse('');
			onStreamingResponse?.('');
			onDisplayedResponse?.('');

			// Reset AI message ID on error
			aiMessageIdRef.current = null;
		},
	});

	useEffect(() => {
		setLocalStreamingResponse('');
	}, [disabled]);

	// Cleanup SSE connection when chat changes
	useEffect(() => {
		return () => {
			disconnect();
		};
	}, [currentChatId, disconnect]);

	// Cleanup timeouts on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (fallbackTimeoutRef.current) {
				clearTimeout(fallbackTimeoutRef.current);
			}
		};
	}, []);

	// Handle selected question from DefaultQuestions
	useEffect(() => {
		if (selectedQuestion && selectedQuestion.trim()) {
			setMessage(selectedQuestion);
			// Auto-submit the question after a short delay to ensure chat is ready
			const timer = setTimeout(() => {
				// Call submit logic directly
				handleSubmitDirectly(selectedQuestion);
				onQuestionProcessed?.();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [selectedQuestion, onQuestionProcessed]);

	useEffect(() => {
		if (localStreamingResponse) {
			const timeout = setTimeout(() => {
				onDisplayedResponse?.(localStreamingResponse);
			}, 50);
			return () => clearTimeout(timeout);
		}
	}, [localStreamingResponse, onDisplayedResponse]);

	// Update selected model when models change
	useEffect(() => {
		if (models.length > 0 && !selectedModel) {
			const defaultModel = models.find((model) => model.isDefault);
			if (defaultModel) {
				setSelectedModel(defaultModel.name);
			} else {
				setSelectedModel(models[0].name);
			}
		}
	}, [models, selectedModel]);

	useEffect(() => {
		const fetchModels = async () => {
			try {
				const response = await aiApi.getModels();
				if (response) {
					setModels(response);
				}
			} catch (error) {
				toast({
					title: 'Error',
					description: 'Failed to fetch AI models',
					variant: 'destructive',
				});
			} finally {
				setIsLoadingModels(false);
			}
		};

		fetchModels();
	}, [toast]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedModel) {
			toast({
				title: 'Error',
				description: 'Please select a model before sending a message',
				variant: 'destructive',
			});
			return;
		}

		if (!message.trim() && attachments.length === 0) return;
		if (isSending) return;

		setIsSending(true);
		setLocalStreamingResponse('');
		onStreamingResponse?.('');
		onDisplayedResponse?.('');

		// Reset AI message ID for new conversation
		aiMessageIdRef.current = null;

		try {
			let chatId = currentChatId;

			// If no chat exists or is temp, create one
			if (!chatId || isTempChat) {
				const chatResponse = await aiApi.createChat();
				chatId = chatResponse.chatId;
				onFirstMessage?.(currentChatId || '', chatId, chatResponse.label);
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			// Add user message to memory
			const userMsg: Message = {
				id: Date.now().toString(),
				content: message,
				sender: 'user',
				timestamp: new Date().toLocaleTimeString(),
			};
			addMessage(chatId, userMsg);

			// Send the message
			const selectedModelData = models.find((m) => m.name === selectedModel);
			if (!selectedModelData) throw new Error('Selected model not found');

			const messageResponse = await aiApi.sendMessage(
				chatId,
				message,
				selectedModelData.id
			);

			if (messageResponse.success) {
				// Update chat label if provided
				if (messageResponse.chatLabel) {
					onFirstMessage?.(chatId, chatId, messageResponse.chatLabel);
				}

				setMessage('');
				setAttachments([]);

				// Store the chatId that will be used for SSE
				currentChatIdRef.current = chatId;

				// Connect to SSE stream after sending message
				connect(chatId);

				// Add a timeout to ensure message is added even if SSE fails
				timeoutRef.current = setTimeout(() => {
					if (isSending && streamingResponseRef.current.trim()) {
						const aiMsg: Message = {
							id: Date.now().toString(),
							content: streamingResponseRef.current,
							sender: 'ai',
							timestamp: new Date().toLocaleTimeString(),
						};
						addMessage(currentChatIdRef.current || chatId, aiMsg);
						setIsSending(false);
						onStreamingStatus?.(false);
						setLocalStreamingResponse('');
						streamingResponseRef.current = '';
						onStreamingResponse?.('');
						onDisplayedResponse?.('');
					}
				}, 5000); // 5 second timeout

				// Fallback: if no SSE response after 10 seconds, add a placeholder message
				fallbackTimeoutRef.current = setTimeout(() => {
					if (isSending && !streamingResponseRef.current.trim()) {
						const fallbackMsg: Message = {
							id: Date.now().toString(),
							content:
								'Response received. Please check the chat for the full message.',
							sender: 'ai',
							timestamp: new Date().toLocaleTimeString(),
						};
						addMessage(currentChatIdRef.current || chatId, fallbackMsg);
						setIsSending(false);
						onStreamingStatus?.(false);
					}
				}, 10000);
			} else {
				throw new Error('Failed to send message');
			}
		} catch (error) {
			console.error('Error sending message:', error);
			toast({
				title: 'Error',
				description:
					error instanceof Error ? error.message : 'Failed to send message',
				variant: 'destructive',
			});
			setIsSending(false);
			onStreamingStatus?.(false);
			setLocalStreamingResponse('');
			onStreamingResponse?.('');
			onDisplayedResponse?.('');
		}
	};

	const handleSubmitDirectly = async (question: string) => {
		if (!selectedModel) {
			toast({
				title: 'Error',
				description: 'Please select a model before sending a message',
				variant: 'destructive',
			});
			return;
		}

		if (!question.trim() && attachments.length === 0) return;
		if (isSending) return;

		setIsSending(true);
		setLocalStreamingResponse('');
		onStreamingResponse?.('');
		onDisplayedResponse?.('');

		// Reset AI message ID for new conversation
		aiMessageIdRef.current = null;

		try {
			let chatId = currentChatId;

			// If no chat exists or is temp, create one
			if (!chatId || isTempChat) {
				const chatResponse = await aiApi.createChat();
				chatId = chatResponse.chatId;
				onFirstMessage?.(currentChatId || '', chatId, chatResponse.label);
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			// Add user message to memory
			const userMsg: Message = {
				id: Date.now().toString(),
				content: question,
				sender: 'user',
				timestamp: new Date().toLocaleTimeString(),
			};
			addMessage(chatId, userMsg);

			// Send the message
			const selectedModelData = models.find((m) => m.name === selectedModel);
			if (!selectedModelData) throw new Error('Selected model not found');

			const messageResponse = await aiApi.sendMessage(
				chatId,
				question,
				selectedModelData.id
			);

			if (messageResponse.success) {
				// Update chat label if provided
				if (messageResponse.chatLabel) {
					onFirstMessage?.(chatId, chatId, messageResponse.chatLabel);
				}

				setMessage('');
				setAttachments([]);

				// Store the chatId that will be used for SSE
				currentChatIdRef.current = chatId;

				// Connect to SSE stream after sending message
				connect(chatId);

				// Add a timeout to ensure message is added even if SSE fails
				timeoutRef.current = setTimeout(() => {
					if (isSending && streamingResponseRef.current.trim()) {
						const aiMsg: Message = {
							id: Date.now().toString(),
							content: streamingResponseRef.current,
							sender: 'ai',
							timestamp: new Date().toLocaleTimeString(),
						};
						addMessage(currentChatIdRef.current || chatId, aiMsg);
						setIsSending(false);
						onStreamingStatus?.(false);
						setLocalStreamingResponse('');
						streamingResponseRef.current = '';
						onStreamingResponse?.('');
						onDisplayedResponse?.('');
					}
				}, 5000); // 5 second timeout

				// Fallback: if no SSE response after 10 seconds, add a placeholder message
				fallbackTimeoutRef.current = setTimeout(() => {
					if (isSending && !streamingResponseRef.current.trim()) {
						const fallbackMsg: Message = {
							id: Date.now().toString(),
							content:
								'Response received. Please check the chat for the full message.',
							sender: 'ai',
							timestamp: new Date().toLocaleTimeString(),
						};
						addMessage(currentChatIdRef.current || chatId, fallbackMsg);
						setIsSending(false);
						onStreamingStatus?.(false);
					}
				}, 10000);
			} else {
				throw new Error('Failed to send message');
			}
		} catch (error) {
			console.error('Error sending message:', error);
			toast({
				title: 'Error',
				description:
					error instanceof Error ? error.message : 'Failed to send message',
				variant: 'destructive',
			});
			setIsSending(false);
			onStreamingStatus?.(false);
			setLocalStreamingResponse('');
			onStreamingResponse?.('');
			onDisplayedResponse?.('');
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		setAttachments((prev) => [...prev, ...files]);
	};

	return (
		<div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
			{/* Attachments */}
			{attachments.length > 0 && (
				<div className="mb-4 flex flex-wrap gap-2">
					{attachments.map((file, index) => (
						<div
							key={index}
							className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full text-sm border border-gray-200 dark:border-gray-700"
						>
							<span className="text-gray-700 dark:text-gray-300">
								{file.name}
							</span>
							<button
								onClick={() =>
									setAttachments((prev) => prev.filter((_, i) => i !== index))
								}
								className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
							>
								×
							</button>
						</div>
					))}
				</div>
			)}

			{/* Input Area */}
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Model Selection */}
				<div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						<span className="font-medium">Model:</span>
					</div>
					<Select
						value={selectedModel}
						onValueChange={setSelectedModel}
						disabled={isLoadingModels}
					>
						<SelectTrigger className="w-48 h-8 text-sm border-none bg-transparent shadow-none focus:ring-0">
							<SelectValue
								placeholder={
									isLoadingModels ? 'Loading models...' : selectedModel
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{models?.map((model) => (
								<SelectItem key={model.id} value={model.name}>
									<div className="flex items-center gap-2">
										<div>
											<div className="font-medium">{model.name}</div>
											<div className="text-xs text-gray-500">
												{model.providerName} •{' '}
												{Math.round(model.maxInputToken / 1000)}k tokens
											</div>
										</div>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Input and Controls */}
				<div className="flex items-end gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-purple-500 dark:focus-within:border-purple-400 transition-colors">
					<div className="flex-1">
						<Textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Type your message here..."
							disabled={disabled || isLoadingModels}
							className="min-h-[50px] max-h-32 resize-none border-none bg-transparent focus:ring-0 focus-visible:ring-0 shadow-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
						/>
					</div>

					{/* Media Buttons */}
					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => fileInputRef.current?.click()}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<Image size={18} />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<Search size={18} />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => fileInputRef.current?.click()}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							<Paperclip size={18} />
						</Button>
					</div>

					{/* Send Button */}
					<Button
						type="submit"
						disabled={
							disabled ||
							isLoadingModels ||
							(!message.trim() && attachments.length === 0) ||
							!selectedModel
						}
						className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4"
					>
						<Send size={18} />
					</Button>
				</div>
			</form>

			{/* Hidden File Input */}
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="image/*,.pdf,.doc,.docx,.txt"
				onChange={handleFileSelect}
				className="hidden"
			/>

			{/* Footer */}
			<div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
				Make sure you agree to our{' '}
				<a
					href="#"
					className="underline hover:text-gray-700 dark:hover:text-gray-200"
				>
					Terms
				</a>{' '}
				and our{' '}
				<a
					href="#"
					className="underline hover:text-gray-700 dark:hover:text-gray-200"
				>
					Privacy Policy
				</a>
			</div>
		</div>
	);
};

export default ChatInput;
