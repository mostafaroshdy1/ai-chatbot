import React, { useState, useEffect } from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
	message: {
		id: string;
		content: string;
		sender: 'user' | 'ai';
		timestamp: string;
		attachments?: Array<{
			type: 'image' | 'document' | 'link';
			url: string;
			name: string;
		}>;
	};
}

// Typewriter effect component for AI messages
const TypewriterText: React.FC<{ content: string; isTyping: boolean }> = ({
	content,
	isTyping,
}) => {
	const [displayedContent, setDisplayedContent] = useState('');
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (!isTyping) {
			setDisplayedContent(content);
			return;
		}

		if (currentIndex < content.length) {
			const timer = setTimeout(() => {
				setDisplayedContent(content.slice(0, currentIndex + 1));
				setCurrentIndex(currentIndex + 1);
			}, 20); // Adjust speed here (lower = faster)

			return () => clearTimeout(timer);
		}
	}, [content, currentIndex, isTyping]);

	// Reset when content changes
	useEffect(() => {
		setDisplayedContent('');
		setCurrentIndex(0);
	}, [content]);

	return (
		<div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 [&>*]:text-gray-800 dark:[&>*]:text-gray-200">
			<ReactMarkdown>{displayedContent}</ReactMarkdown>
			{isTyping && currentIndex < content.length && (
				<span className="inline-block w-2 h-4 bg-gray-800 dark:bg-gray-200 ml-1 animate-pulse"></span>
			)}
		</div>
	);
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
	const [copiedCode, setCopiedCode] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState(message.sender === 'ai');
	const [previousContent, setPreviousContent] = useState(message.content);

	// Handle streaming updates for AI messages
	useEffect(() => {
		if (message.sender === 'ai') {
			// If content changed, it means it's being streamed
			if (message.content !== previousContent) {
				setIsTyping(true);
				setPreviousContent(message.content);

				// Stop typing effect after a short delay
				const timer = setTimeout(() => {
					setIsTyping(false);
				}, 500); // Longer delay for streaming
				return () => clearTimeout(timer);
			}
		}
	}, [message.content, message.sender, previousContent]);

	const copyToClipboard = async (text: string, codeId: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedCode(codeId);
			setTimeout(() => setCopiedCode(null), 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	// Add global copy function
	React.useEffect(() => {
		(window as Window & typeof globalThis).copyCode = (
			code: string,
			codeId: string
		) => {
			copyToClipboard(code, codeId);
			const copyIcon = document.querySelector(`.copy-icon-${codeId}`);
			if (copyIcon) {
				copyIcon.innerHTML = copiedCode === codeId ? 'Copied!' : 'Copy';
			}
		};
	}, [copiedCode]);

	return (
		<div
			className={`flex gap-4 p-6 ${
				message.sender === 'ai'
					? 'bg-gray-50 dark:bg-gray-800/50'
					: 'bg-white dark:bg-gray-900'
			}`}
		>
			<Avatar className="w-8 h-8 flex-shrink-0">
				<AvatarFallback
					className={
						message.sender === 'ai'
							? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
							: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
					}
				>
					{message.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
				</AvatarFallback>
			</Avatar>

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-2">
					<span className="font-medium text-sm text-gray-900 dark:text-gray-100">
						{message.sender === 'ai' ? 'Assistant' : 'You'}
					</span>
					<span className="text-xs text-gray-500 dark:text-gray-400">
						{message.timestamp}
					</span>
				</div>

				{message.attachments && message.attachments.length > 0 && (
					<div className="mb-3 space-y-2">
						{message.attachments.map((attachment, index) => (
							<div
								key={index}
								className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded"
							>
								<span className="text-sm text-gray-600 dark:text-gray-400">
									{attachment.name}
								</span>
							</div>
						))}
					</div>
				)}

				{message.sender === 'ai' ? (
					<TypewriterText content={message.content} isTyping={isTyping} />
				) : (
					<div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 [&>*]:text-gray-800 dark:[&>*]:text-gray-200">
						{message.content}
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatMessage;
