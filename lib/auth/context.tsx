/**
 * Authentication Context
 */

"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { User, LoginCredentials, SignupCredentials, AuthContextType } from "./types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("efiche_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user - in production, verify with backend
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: credentials.email,
        name: credentials.email.split("@")[0],
        role: "user",
        avatar: `https://ui-avatars.com/api/?name=${credentials.email.split("@")[0]}`,
      };

      setUser(mockUser);
      localStorage.setItem("efiche_user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setIsLoading(true);
    try {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: credentials.email,
        name: credentials.name,
        role: "user",
        avatar: `https://ui-avatars.com/api/?name=${credentials.name}`,
      };

      setUser(mockUser);
      localStorage.setItem("efiche_user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("efiche_user");
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
