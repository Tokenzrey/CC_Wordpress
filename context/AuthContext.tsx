import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Types ---
export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'starter' | 'pro' | 'business' | 'enterprise';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Mock Utils ---
const STORAGE_KEY_TOKEN = 'wpcube_token';
const STORAGE_KEY_USER = 'wpcube_user';
const STORAGE_KEY_EXPIRY = 'wpcube_expiry';
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 Hours

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Initialization: Check LocalStorage on Mount
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      const expiry = localStorage.getItem(STORAGE_KEY_EXPIRY);

      if (storedToken && storedUser && expiry) {
        // Check Expiration
        if (Date.now() > parseInt(expiry, 10)) {
          console.warn('Session expired. Logging out.');
          logout(); // Auto logout
        } else {
          // Restore Session
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 2. Login Function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate Network Delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock Validation Logic
    // In a real app, this would be an API call to your backend
    if (email.includes('@') && password.length >= 6) {
      
      // Determine plan based on email for demo purposes
      let plan: User['plan'] = 'starter';
      if (email.includes('pro')) plan = 'pro';
      if (email.includes('biz')) plan = 'business';
      if (email.includes('ent')) plan = 'enterprise';

      const mockUser: User = {
        id: `user_${Math.floor(Math.random() * 10000)}`,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1), // "Demo" from "demo@..."
        email: email,
        plan: plan,
        avatar: 'https://i.pravatar.cc/150?img=12'
      };

      // Generate Mock JWT (Base64 encoded JSON)
      const mockToken = btoa(JSON.stringify({ 
        sub: mockUser.id, 
        exp: Date.now() + EXPIRATION_TIME,
        role: 'admin' 
      }));

      // Save to Storage
      localStorage.setItem(STORAGE_KEY_TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
      localStorage.setItem(STORAGE_KEY_EXPIRY, (Date.now() + EXPIRATION_TIME).toString());

      // Update State
      setToken(mockToken);
      setUser(mockUser);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_EXPIRY);
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  // Prevent rendering app content until auth check is done to avoid redirects
  if (isLoading && !user && !token) { 
     // We only return null on the very first mount check. 
     // Subsequent loading states (during login) should utilize the UI loading indicators.
     // However, for the 'reload' fix, we keep `isLoading` true until localStorage is checked.
     // If we are strictly initializing:
     if (!localStorage.getItem(STORAGE_KEY_TOKEN)) {
        // No token potentially found, we can stop loading immediately in the effect, 
        // but since effect runs after render, we might flash.
        // For simplicity in this mock, we render a white screen or a loader here.
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
     }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};