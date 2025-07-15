'use client';

import { supabase } from '@/data/supabase';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-provider';

type Theme = 'light' | 'dark' | 'pink' | 'yellow' | 'blue' | 'green';

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user, setUser } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const savedTheme = (user?.theme || localStorage.getItem('theme')) as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.className = theme;
    if (user && user.theme !== theme) {
      supabase
        .from('Users')
        .update({ theme })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to save theme', error);
          } else {
            setUser(prev => (prev ? { ...prev, theme } : prev));
          }
        });
    }
  }, [theme, user, setUser]);

  const value = {
    theme,
    setTheme: (t: Theme) => {
      setThemeState(t);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};