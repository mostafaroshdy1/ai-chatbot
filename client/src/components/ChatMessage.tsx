
import React, { useState } from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: string;
    attachments?: Array<{ type: 'image' | 'document' | 'link'; url: string; name: string }>;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatContent = (content: string) => {
    let codeBlockCounter = 0;
    
    // Enhanced markdown-like formatting with syntax highlighting
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        const codeId = `code-${message.id}-${codeBlockCounter++}`;
        const cleanCode = code.trim();
        return `<div class="code-block-container my-4">
          <div class="flex items-center justify-between bg-gray-800 dark:bg-gray-900 text-gray-300 px-4 py-2 rounded-t-lg border-b border-gray-700">
            <span class="text-sm font-mono">${language || 'code'}</span>
            <button onclick="copyCode('${cleanCode.replace(/'/g, "\\'")}', '${codeId}')" 
                    class="copy-btn flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
              <span class="copy-icon-${codeId}">Copy</span>
            </button>
          </div>
          <pre class="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-b-lg overflow-x-auto border border-gray-700"><code class="language-${language || 'text'}">${cleanCode}</code></pre>
        </div>`;
      })
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">$1</h1>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4 text-gray-800 dark:text-gray-200">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 text-gray-800 dark:text-gray-200 list-decimal">$1</li>');
    
    return { __html: formatted };
  };

  // Add global copy function
  React.useEffect(() => {
    (window as any).copyCode = (code: string, codeId: string) => {
      copyToClipboard(code, codeId);
      const copyIcon = document.querySelector(`.copy-icon-${codeId}`);
      if (copyIcon) {
        copyIcon.innerHTML = copiedCode === codeId ? 'Copied!' : 'Copy';
      }
    };
  }, [copiedCode]);

  return (
    <div className={`flex gap-4 p-6 ${
      message.sender === 'ai' 
        ? 'bg-gray-50 dark:bg-gray-800/50' 
        : 'bg-white dark:bg-gray-900'
    }`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={
          message.sender === 'ai' 
            ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400' 
            : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
        }>
          {message.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {message.sender === 'ai' ? 'Assistant' : 'You'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{message.timestamp}</span>
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">{attachment.name}</span>
              </div>
            ))}
          </div>
        )}
        
        <div 
          className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 [&>*]:text-gray-800 dark:[&>*]:text-gray-200"
          dangerouslySetInnerHTML={formatContent(message.content)}
        />
      </div>
    </div>
  );
};

export default ChatMessage;
