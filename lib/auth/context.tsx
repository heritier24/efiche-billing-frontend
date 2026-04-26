/**
 * Authentication Context - Backend API Integration
 */

"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { User, LoginCredentials, SignupCredentials, AuthContextType, LoginResponse } from "./types";
import { authApi, ApiError } from "@/lib/api/backend";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("efiche_user");
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem("efiche_user", JSON.stringify(currentUser));
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem("auth_token");
            localStorage.removeItem("efiche_user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("efiche_user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      
      // Store token and user data
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("efiche_user", JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      console.error("Login error:", error);
      
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error("Invalid email or password");
        } else if (error.status === 422 && error.errors) {
          const errorMessage = Object.values(error.errors).flat().join(', ');
          throw new Error(errorMessage);
        }
        throw new Error(error.message || "Login failed");
      }
      
      throw new Error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.register(credentials);
      
      // After successful registration, log the user in
      await login({
        email: credentials.email,
        password: credentials.password
      });
    } catch (error) {
      console.error("Signup error:", error);
      
      if (error instanceof ApiError) {
        if (error.status === 422 && error.errors) {
          const errorMessage = Object.values(error.errors).flat().join(', ');
          throw new Error(errorMessage);
        } else if (error.status === 403) {
          throw new Error("You don't have permission to register new users");
        }
        throw new Error(error.message || "Registration failed");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate token
      await authApi.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state
      setUser(null);
      setToken(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("efiche_user");
    }
  }, []);

  const getCurrentUser = useCallback(async (): Promise<User> => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem("efiche_user", JSON.stringify(currentUser));
      return currentUser;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    signup,
    logout,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
