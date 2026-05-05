// context/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';

export const Colors = {
  light: {
    background: '#F5F5F7',
    card: '#FFFFFF',
    text: '#1C1C1E',
    subText: '#8E8E93',
    primary: '#007AFF',
    border: '#E5E5EA',
    input: '#FFFFFF',
    danger: '#FF3B30',
    statusBadge: '#F2F2F7',
    success: '#34C759',
  },
  dark: {
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    subText: '#98989D',
    primary: '#0A84FF',
    border: '#2C2C2E',
    input: '#1C1C1E',
    danger: '#FF453A',
    statusBadge: '#2C2C2E',
    success: '#34C759'
  }
};

interface ThemeContextProps {
  theme: 'light' | 'dark';
  colors: typeof Colors.light;
  toggleTheme: () => void;
  username: string;
  updateUsername: (name: string) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAppData = async () => {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      const savedName = await AsyncStorage.getItem('user_name');
      if (savedTheme) setTheme(savedTheme as 'light' | 'dark');
      if (savedName) setUsername(savedName);
      setIsLoading(false);
    };
    loadAppData();
  }, []);

  const updateUsername = async (name: string) => {
    setUsername(name);
    await AsyncStorage.setItem('user_name', name);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('app_theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: Colors[theme], toggleTheme, username, updateUsername, isLoading }}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};