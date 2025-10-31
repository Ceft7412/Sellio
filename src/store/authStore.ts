import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../constants/axios";

// User type
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  identityVerified: boolean;
}

// Auth store type
interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleAuth: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

// Create Zustand store
export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  // Initialize auth state on app startup
  initialize: async () => {
    try {
      // Get stored token
      const storedToken = await SecureStore.getItemAsync("authToken");

      if (storedToken) {
        set({ token: storedToken });

        // Fetch user profile
        try {
          const response = await authAPI.getProfile();
          set({ user: response.data.user });
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          // Clear invalid token
          await SecureStore.deleteItemAsync("authToken");
          set({ token: null });
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    } finally {
      set({ isInitialized: true });
    }
  },

  // Register function
  register: async (email, password, fullName) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register({
        email,
        password,
        fullName,
      });

      const { token: newToken, user: newUser } = response.data;

      // Save token to secure store
      await SecureStore.setItemAsync("authToken", newToken);

      // Update state
      set({ token: newToken, user: newUser });
      return newUser;
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw new Error(
        error.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      set({ isLoading: false });
    }
  },

  // Login function
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login({ email, password });

      const { token: newToken, user: newUser } = response.data;

      // Save token to secure store
      await SecureStore.setItemAsync("authToken", newToken);

      // Update state
      set({ token: newToken, user: newUser });
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(
        error.response?.data?.error || "Login failed. Please try again."
      );
    } finally {
      set({ isLoading: false });
    }
  },

  // Google auth function
  googleAuth: async (idToken) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.googleAuth({ idToken });

      const { token: newToken, user: newUser } = response.data;

      // Save token to secure store
      await SecureStore.setItemAsync("authToken", newToken);

      // Update state
      set({ token: newToken, user: newUser });
    } catch (error: any) {
      console.error("Google auth failed:", error);
      throw new Error(
        error.response?.data?.error ||
          "Google authentication failed. Please try again."
      );
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout function
  logout: async () => {
    try {
      // Clear token from secure store
      await SecureStore.deleteItemAsync("authToken");

      // Clear state
      set({ token: null, user: null });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  // Refresh user profile
  refreshUser: async () => {
    try {
      const response = await authAPI.getProfile();
      set({ user: response.data.user });
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  },

  // Setters
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}));
