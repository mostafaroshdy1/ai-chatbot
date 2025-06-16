import React from 'react';
import { Button } from '@/components/ui/button';
import {
	User,
	Menu,
	Plus,
	MessageSquare,
	Settings,
	LogOut,
} from 'lucide-react';
import { User as UserType } from '@/lib/types/api';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
	isCollapsed: boolean;
	onToggle: () => void;
	onNewChat: () => void;
	chats: Array<{
		id: string;
		title: string;
		timestamp: string;
	}>;
	onChatSelect: (chatId: string) => void;
	selectedChatId: string | null;
	isLoggedIn: boolean;
	onLogin: () => void;
	onLogout: () => void;
	currentUser: UserType | null;
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
	onLogout,
	currentUser,
}) => {
	return (
		<div
			className={`flex flex-col h-full bg-gray-900 text-white transition-all duration-300 ${
				isCollapsed ? 'w-16' : 'w-64'
			}`}
		>
			{/* Header */}
			<div className="p-4 border-b border-gray-800 flex items-center justify-between">
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggle}
					className="text-gray-400 hover:text-white"
				>
					<Menu size={20} />
				</Button>
				{!isCollapsed && <span className="font-semibold">Chat History</span>}
			</div>

			{/* New Chat Button */}
			<div className="p-4">
				<Button
					onClick={onNewChat}
					className={`w-full bg-purple-600 hover:bg-purple-700 ${
						isCollapsed ? 'px-2' : 'px-4'
					}`}
				>
					<Plus size={20} className={isCollapsed ? '' : 'mr-2'} />
					{!isCollapsed && 'New Chat'}
				</Button>
			</div>

			{/* Chat List */}
			<div className="flex-1 overflow-y-auto">
				{chats.map((chat) => (
					<button
						key={chat.id}
						onClick={() => onChatSelect(chat.id)}
						className={`w-full text-left p-4 hover:bg-gray-800 flex items-center ${
							selectedChatId === chat.id ? 'bg-gray-800' : ''
						}`}
					>
						<MessageSquare size={20} className="mr-3 text-gray-400" />
						{!isCollapsed && (
							<div className="flex-1 min-w-0">
								<div className="truncate">{chat.title}</div>
								<div className="text-xs text-gray-500">{chat.timestamp}</div>
							</div>
						)}
					</button>
				))}
			</div>

			{/* Footer */}
			<div className="p-4 border-t border-gray-800 space-y-2">
				<ThemeToggle isCollapsed={isCollapsed} />
				{isLoggedIn ? (
					<div className="space-y-2">
						<div
							className={`flex items-center text-gray-300 p-2 ${
								isCollapsed ? 'justify-center' : ''
							}`}
						>
							<User size={20} className={isCollapsed ? '' : 'mr-3'} />
							{!isCollapsed && (
								<div className="flex-1 min-w-0">
									<div className="truncate">
										{currentUser?.firstName} {currentUser?.lastName}
									</div>
									<div className="text-xs text-gray-500 truncate">
										{currentUser?.email}
									</div>
								</div>
							)}
						</div>
						<Button
							onClick={onLogout}
							variant="ghost"
							className="w-full text-gray-300 hover:text-white hover:bg-gray-800 justify-start"
						>
							<LogOut size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
							{!isCollapsed && 'Logout'}
						</Button>
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
