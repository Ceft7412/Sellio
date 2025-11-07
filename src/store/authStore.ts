import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../constants/axios";
import {
  registerForPushNotificationsAsync,
  unregisterPushNotifications,
} from "../utils/pushNotifications";

// User type
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  identityVerified: boolean;
  phoneNumber?: string | null;
  bio?: string | null;
  businessDocuments?: {
    url: string;
    name?: string;
    uploadedAt?: string;
  } | null;
  createdAt?: string;
}

// Auth store type
interface AuthStore {
  user: User | null;
  token: string | null;
  pushToken: string | null;
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
  setPushToken: (pushToken: string | null) => void;
}

// Create Zustand store
export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  pushToken: null,
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

          // Register for push notifications (optional, won't break if denied)
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) {
            set({ pushToken });
          }
        } catch (error) {
          // Clear invalid token
          await SecureStore.deleteItemAsync("authToken");
          set({ token: null });
        }
      }
    } catch (error) {
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

      // Register for push notifications (optional)
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        set({ pushToken });
      }

      return newUser;
    } catch (error: any) {
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

      // Register for push notifications (optional)
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        set({ pushToken });
      }
    } catch (error: any) {
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

      // Register for push notifications (optional)
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        set({ pushToken });
      }
    } catch (error: any) {
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
      const { pushToken } = get();

      // Unregister push notifications
      if (pushToken) {
        await unregisterPushNotifications(pushToken);
      }

      // Clear token from secure store
      await SecureStore.deleteItemAsync("authToken");

      // Clear state
      set({ token: null, user: null, pushToken: null });
    } catch (error) {}
  },

  // Refresh user profile
  refreshUser: async () => {
    try {
      const response = await authAPI.getProfile();
      set({ user: response.data.user });
    } catch (error) {}
  },

  // Setters
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setPushToken: (pushToken) => set({ pushToken }),
}));
