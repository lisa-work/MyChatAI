'use client';

import { supabase } from '@/data/supabase';
import { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';

type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  password: string;
  theme?: string; // Optional theme preference
};

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthProviderState = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const initialState: AuthProviderState = {
  user: null,
  setUser: () => {}, // Default no-op function
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
  const { data, error } = await supabase
    .from('Users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    throw new Error('User not found');
  }

  // ✅ Compare entered password with hashed password in DB
  const isMatch = await bcrypt.compare(password, data.password);
  if (!isMatch) {
    throw new Error('Invalid password');
  }

  const formattedUser: User = {
    id: data.id,
    email: data.email,
    name: data.name,
    avatar: data.avatar,
    password: data.password,
    theme: data.theme
  };

  setUser(formattedUser);
  localStorage.setItem('user', JSON.stringify(formattedUser));
};


 const signup = async (email: string, password: string, name: string) => {
  // ✅ Check if name already exists
  const { data: existingUser, error: existingError } = await supabase
    .from('Users')
    .select('*')
    .eq('name', name)
    .single();

  if (existingUser) {
    throw new Error('Username already exists. Please choose another one.');
  }

  if (existingError && existingError.code !== 'PGRST116') {
    // Ignore "no rows found" error code; otherwise, throw
    throw new Error(existingError.message);
  }

  // ✅ Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;

  const { data, error } = await supabase
    .from('Users')
    .insert([
      {
        email,
        password: hashedPassword,
        name,
        avatar: avatarUrl,
        theme: 'light',
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const formattedUser: User = {
    id: data.id,
    email: data.email,
    name: data.name,
    avatar: data.avatar,
    password: data.password,
    theme: data.theme
  };

  setUser(formattedUser);
  localStorage.setItem('user', JSON.stringify(formattedUser));
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('theme');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    setUser,
  };

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
