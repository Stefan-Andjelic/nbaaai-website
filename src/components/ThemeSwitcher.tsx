'use client';

import React, { useState, useEffect } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeSwitcher: React.FC = () => {
  const { mode, toggleTheme } = useThemeContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {mode === 'dark' ? (
        <Sun className="h-6 w-6 text-yellow-500" />
      ) : (
        <Moon className="h-6 w-6 text-gray-800" />
      )}
    </button>
  );
};

export default ThemeSwitcher;