
import React, { useState } from 'react';
import { Search, Plus, MessageSquare, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  chats: Array<{ id: string; title: string; timestamp: string }>;
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
  isLoggedIn: boolean;
  onLogin: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  onNewChat,
  chats,
  onChatSelect,
  selectedChatId,
  isLoggedIn,
  onLogin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`bg-gray-900 dark:bg-gray-950 border-r border-gray-800 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              T3.chat
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-gray-400 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-800"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
        >
          <Plus size={16} className={isCollapsed ? 'mx-auto' : 'mr-2'} />
          {!isCollapsed && 'New Chat'}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search your threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 dark:bg-gray-900 border-gray-700 dark:border-gray-600 text-white pl-10 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 px-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Chats</h3>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedChatId === chat.id
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-800'
                    }`}
                  >
                    <MessageSquare size={16} className="mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chat.title}</p>
                      <p className="text-xs opacity-70">{chat.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* User Section */}
      <div className="p-4 border-t border-gray-800 dark:border-gray-700 space-y-2">
        <ThemeToggle isCollapsed={isCollapsed} />
        {isLoggedIn ? (
          <div className={`flex items-center text-gray-300 p-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <User size={20} className={isCollapsed ? '' : 'mr-3'} />
            {!isCollapsed && <span>User Account</span>}
          </div>
        ) : (
          <Button
            onClick={onLogin}
            variant="ghost"
            className="w-full text-gray-300 hover:text-white hover:bg-gray-800 justify-start"
          >
            <User size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
            {!isCollapsed && 'Login'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
