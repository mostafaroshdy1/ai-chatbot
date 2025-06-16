
import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  isCollapsed?: boolean;
  variant?: 'sidebar' | 'main';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isCollapsed = false, variant = 'sidebar' }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={20} />;
      case 'dark':
        return <Moon size={20} />;
      default:
        return <Monitor size={20} />;
    }
  };

  if (variant === 'main') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        title={`Current theme: ${theme}`}
      >
        {getIcon()}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700 w-full justify-start"
      title={`Current theme: ${theme}`}
    >
      <div className="flex items-center w-full">
        <span className={isCollapsed ? 'mx-auto' : 'mr-3'}>{getIcon()}</span>
        {!isCollapsed && <span>Theme</span>}
      </div>
    </Button>
  );
};

export default ThemeToggle;
