import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { User } from '../types/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token is still valid
          await api.get('/auth/me');
        } catch (error) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error('Sign in error:', error);
      // Extract error message from response
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        fullName 
      });
      const { token, user: userData } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error('Sign up error:', error);
      // Extract error message from response
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const sendOTP = async (email: string) => {
    try {
      await api.post('/auth/send-otp', { email });
    } catch (error: any) {
      console.error('Send OTP error:', error);
      // Extract error message from response
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send OTP';
      throw new Error(errorMessage);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      await api.post('/auth/verify-otp', { email, otp });
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      // Extract error message from response
      const errorMessage = error.response?.data?.error || error.message || 'Invalid or expired OTP';
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    sendOTP,
    verifyOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};