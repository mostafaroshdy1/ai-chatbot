
import React, { useState, useRef } from 'react';
import { Send, Paperclip, Search, Image, Sparkles, Zap, Brain, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
}

const models = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', icon: Zap, description: 'Fast and efficient' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', icon: Sparkles, description: 'Advanced reasoning' },
  { id: 'gpt-4', name: 'GPT-4', icon: Brain, description: 'OpenAI flagship' },
  { id: 'claude-4', name: 'Claude 4 Sonnet', icon: Bot, description: 'Anthropic latest' },
];

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
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
    setAttachments(prev => [...prev, ...files]);
  };

  const selectedModelData = models.find(model => model.id === selectedModel);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full text-sm border border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
              <button
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
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
            {selectedModelData && <selectedModelData.icon size={16} />}
            <span className="font-medium">Model:</span>
          </div>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48 h-8 text-sm border-none bg-transparent shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <model.icon size={14} />
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.description}</div>
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
              disabled={disabled}
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
            disabled={disabled || (!message.trim() && attachments.length === 0)}
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
        <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-200">Terms</a>
        {' '}and our{' '}
        <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-200">Privacy Policy</a>
      </div>
    </div>
  );
};

export default ChatInput;
