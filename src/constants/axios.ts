import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Get API base URL and API key from environment variables
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";
const API_KEY = process.env.EXPO_PUBLIC_APP_API_KEY;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY, // Add API key to all requests
  },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Get token from SecureStore
      const token = await SecureStore.getItemAsync("authToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  async (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          await SecureStore.deleteItemAsync("authToken");
          console.log("Unauthorized - token cleared");
          // You can dispatch a logout action o r navigate to login here
          break;

        case 403:
          // Forbidden
          console.error("Access forbidden:", data.error);
          break;

        case 404:
          // Not found
          console.error("Resource not found:", data.error);
          break;

        case 500:
          // Server error
          console.error("Server error:", data.error);
          break;

        default:
          console.error("API Error:", data.error || error.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network error - no response received");
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// Export helper functions for common operations

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; fullName: string }) =>
    axiosInstance.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    axiosInstance.post("/auth/login", data),

  googleAuth: (data: { code?: string; idToken?: string }) =>
    axiosInstance.post("/auth/google", data),

  getProfile: () => axiosInstance.get("/auth/profile"),
};

// Messages API
export const messagesAPI = {
  createNormalConversation: (data: {
    participant2Id: string;
    productId?: string;
  }) => axiosInstance.post("/messages/create-normal-conversation", data),
  createNegotiableConversation: (data: {
    participant2Id: string;
    productId: string;
    offerPrice: string;
  }) => axiosInstance.post("/messages/create-negotiable-conversation", data),
  createBuyConversation: (data: {
    participant2Id: string;
    productId: string;
    productTitle: string;
  }) => axiosInstance.post("/messages/create-buy-conversation", data),
  getConversations: () => axiosInstance.get("/messages/get-conversations"),
  getConversation: (conversationId: string) =>
    axiosInstance.get(`/messages/get-conversation/${conversationId}`),
  getMessages: (conversationId: string) =>
    axiosInstance.get(`/messages/get-messages/${conversationId}`),
  sendMessage: (data: {
    conversationId: string;
    content: string;
    messageType?: string;
    imageUrl?: string;
  }) => axiosInstance.post("/messages/send-message", data),
  markMessagesAsRead: (conversationId: string) =>
    axiosInstance.post(`/messages/mark-messages-as-read/${conversationId}`),
  uploadChatImage: (imageUri: string) => {
    const formData = new FormData();
    // @ts-ignore - React Native FormData accepts uri differently
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "chat-image.jpg",
    });
    return axiosInstance.post("/messages/upload-chat-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Products API
export const productsAPI = {
  getAll: (params?: {
    category?: string;
    status?: string;
    saleType?: string;
    limit?: number;
    offset?: number;
  }) => axiosInstance.get("/products", { params }),

  getById: (id: string) => axiosInstance.get(`/products/${id}`),

  create: (data: FormData) =>
    axiosInstance.post("/products", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id: string, data: any) => axiosInstance.put(`/products/${id}`, data),

  delete: (id: string) => axiosInstance.delete(`/products/${id}`),

  getUserProducts: () => axiosInstance.get("/products/user/my-products"),

  // Favorites
  toggleFavorite: (productId: string) =>
    axiosInstance.post(`/products/${productId}/favorite`),

  getUserFavorites: () => axiosInstance.get("/products/user/favorites"),
};

export const categoriesAPI = {
  getAll: () => axiosInstance.get("/categories"),

  getParentCategories: () => axiosInstance.get("/categories/parent-only"),

  getById: (id: string) => axiosInstance.get(`/categories/${id}`),

  getAllCategoriesWithTotalProducts: () =>
    axiosInstance.get("/categories/getAllCategoriesWithTotalProducts"),

  getCategoryAttributes: (categoryId: string, subCategoryId: string) =>
    axiosInstance.get(`/category-attributes/${categoryId}/${subCategoryId}`),
};

export const userAPI = {
  verifyIdentity: () => axiosInstance.put("/user/verify-identity"),
};

// Offers API
export const offersAPI = {
  create: (data: {
    productId: string;
    offerAmount: string;
    message?: string;
    expiresAt?: string;
  }) => axiosInstance.post("/offers", data),

  getProductOffers: (productId: string) =>
    axiosInstance.get(`/offers/product/${productId}`),

  getUserOffers: () => axiosInstance.get("/offers/user/my-offers"),

  acceptOffer: (offerId: string) => axiosInstance.put(`/offers/${offerId}/accept`),

  rejectOffer: (offerId: string) => axiosInstance.put(`/offers/${offerId}/reject`),

  updateOffer: (offerId: string, newAmount: string) =>
    axiosInstance.put(`/offers/${offerId}/update`, { newAmount }),
};

// Transactions API
export const transactionsAPI = {
  proposeMeetup: (
    transactionId: string,
    data: {
      scheduledMeetupAt: string;
      meetupLocation: string;
      meetupCoordinates: any;
    }
  ) => axiosInstance.post(`/transactions/${transactionId}/propose-meetup`, data),

  acceptMeetup: (transactionId: string) =>
    axiosInstance.post(`/transactions/${transactionId}/accept-meetup`),
};
