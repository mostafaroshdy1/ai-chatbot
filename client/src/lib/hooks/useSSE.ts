import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { storage } from '../utils/storage';

interface UseSSEOptions {
	onMessage: (chunk: string) => void;
	onComplete: () => void;
	onError: (error: Error) => void;
}

interface SSEMessage {
	text: string;
	isFinal: boolean;
	id: string;
}

export const useSSE = ({ onMessage, onComplete, onError }: UseSSEOptions) => {
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const retryCount = useRef(0);
	const maxRetries = 3;
	const isConnecting = useRef(false);
	const controller = useRef<AbortController | null>(null);

	const connect = useCallback(
		async (chatId) => {
			// Don't attempt connection if no chatId
			if (!chatId) {
				console.log('[SSE] No chatId provided, skipping connection');
				return;
			}

			if (retryCount.current >= maxRetries || isConnecting.current) {
				console.log(
					'[SSE] Skipping connection - max retries reached or already connecting'
				);
				return;
			}

			isConnecting.current = true;
			console.log('[SSE] Attempting to connect...', {
				chatId,
				retryCount: retryCount.current,
			});

			try {
				// Create new AbortController for this connection
				controller.current = new AbortController();

				await fetchEventSource(
					`http://localhost:4444/chat/${chatId}/stream?accessToken=${storage.getToken()}`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'text/event-stream',
						},
						signal: controller.current.signal,
						onopen: async (response) => {
							if (response.ok) {
								setIsConnected(true);
								retryCount.current = 0;
								setError(null);
								console.log('[SSE] Connection established successfully', {
									status: response.status,
									headers: Object.fromEntries(response.headers.entries()),
								});
							} else {
								console.error('[SSE] Connection failed', {
									status: response.status,
									statusText: response.statusText,
								});
								throw new Error(
									`Failed to open SSE connection: ${response.status}`
								);
							}
						},
						onmessage(event) {
							try {
								const message: SSEMessage = JSON.parse(event.data);
								console.log('[SSE] Message received:', message);

								if (message.text) {
									onMessage(message.text);
								}

								if (message.isFinal) {
									console.log('[SSE] Stream complete, closing connection');
									controller.current?.abort();
									onComplete();
								}
							} catch (err) {
								console.error('[SSE] Failed to parse message:', err);
							}
						},
						onerror(err) {
							retryCount.current += 1;
							setError(err);
							console.error('[SSE] Connection error:', {
								error: err,
								retryCount: retryCount.current,
							});
							if (retryCount.current >= maxRetries) {
								onError(new Error('Max retry attempts reached'));
							}
						},
						onclose() {
							setIsConnected(false);
							isConnecting.current = false;
							console.log('[SSE] Connection closed');
						},
					}
				);
			} catch (err) {
				retryCount.current += 1;
				setError(err as Error);
				console.error('[SSE] Connection failed:', {
					error: err,
					retryCount: retryCount.current,
				});
				if (retryCount.current >= maxRetries) {
					onError(new Error('Max retry attempts reached'));
				}
			} finally {
				isConnecting.current = false;
			}
		},
		[onMessage, onComplete, onError]
	);

	return {
		isConnected,
		error,
		connect,
	};
};
