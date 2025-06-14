export enum ChatError {
  ChatNotFound = 'Chat not found',
  ChatNotBelongToUser = 'Chat does not belong to the user',
  ErrorStreamingResponse = 'Error streaming response',
  NoStreamingForThisChat = 'No streaming for this chat',
  ErrorUpdatingChatLabel = 'Error updating chat label',
  AiModelNotAvailable = 'AI model not available',
}
