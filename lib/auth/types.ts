/**
 * Authentication Types - Backend API Integration
 */

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "cashier" | "staff";
  avatar?: string | null;
  created_at?: string;
  last_login?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  expires_in: number;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "admin" | "cashier" | "staff";
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
}
