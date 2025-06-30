import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./api";

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  profile_pic: string | null;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  statusCode: number;
  data: {
    user: User;
    token: string;
  };
  message: string;
  success: boolean;
  errors: null | string[];
}

export interface RegisterResponse {
  statusCode: number;
  data: User;
  message: string;
  success: boolean;
  errors: null | string[];
}

// Register user
export const registerUser = async (
  userData: RegisterData
): Promise<RegisterResponse> => {
  return apiClient.post<RegisterResponse>("/users/register", userData);
};

// Login user
export const loginUser = async (
  loginData: LoginData
): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>("/users/login", loginData);
};

// React Query hooks
export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log("Registration successful:", data);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("Login successful:", data);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};
