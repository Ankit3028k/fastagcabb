import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  card: string;
  shadow: string;
}

const lightTheme: ThemeColors = {
  primary: '#1ca63a',      // Green - primary actions, success states
  secondary: '#df5921',    // Orange - secondary actions, warnings
  background: '#ffffff',   // White - main background
  surface: '#ffffff',      // White - card/surface backgrounds
  text: '#1A1A1A',        // Dark text on light backgrounds
  textSecondary: '#7e8689', // Grey - secondary text
  border: '#7e8689',       // Grey - borders and dividers
  success: '#1ca63a',      // Green - success messages
  warning: '#d5a81a',      // Yellow - warning messages
  error: '#df5921',        // Orange - error messages (softer than red)
  info: '#7e8689',         // Grey - info messages
  card: '#ffffff',         // White - card backgrounds
  shadow: '#7e8689',       // Grey - shadow color
};

const darkTheme: ThemeColors = {
  primary: '#1ca63a',      // Green - primary actions, success states
  secondary: '#df5921',    // Orange - secondary actions, warnings
  background: '#1A1A1A',   // Dark background (using existing dark text color)
  surface: '#2A2A2A',      // Slightly lighter dark surface
  text: '#ffffff',         // White text on dark backgrounds
  textSecondary: '#7e8689', // Grey - secondary text (same as light)
  border: '#7e8689',       // Grey - borders and dividers
  success: '#1ca63a',      // Green - success messages
  warning: '#d5a81a',      // Yellow - warning messages
  error: '#df5921',        // Orange - error messages
  info: '#7e8689',         // Grey - info messages
  card: '#2A2A2A',         // Dark card backgrounds
  shadow: '#000000',       // Black shadow for dark theme
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const systemColorScheme = useColorScheme();

  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const value: ThemeContextType = {
    theme,
    colors,
    isDark,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
