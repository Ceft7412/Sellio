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
    } catch (error) {}

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
          // You can dispatch a logout action o r navigate to login here
          break;

        case 403:
          // Forbidden
          break;

        case 404:
          // Not found
          break;

        case 500:
          // Server error
          break;

        default:
      }
    } else if (error.request) {
      // Request was made but no response received
    } else {
      // Something else happened
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

  // View tracking
  trackView: (productId: string) =>
    axiosInstance.post(`/products/${productId}/view`),

  // Seller analytics
  getSellerAnalytics: () => axiosInstance.get("/products/user/analytics"),
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
  verifyIdentity: () => axiosInstance.put("/users/verify-identity"),
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

  acceptOffer: (offerId: string) =>
    axiosInstance.put(`/offers/${offerId}/accept`),

  rejectOffer: (offerId: string) =>
    axiosInstance.put(`/offers/${offerId}/reject`),

  updateOffer: (offerId: string, newAmount: string) =>
    axiosInstance.put(`/offers/${offerId}/update`, { newAmount }),
};

// Buys API
export const buysAPI = {
  confirmBuy: (buyId: string) => axiosInstance.put(`/buys/${buyId}/confirm`),
};

// Bids API
export const bidsAPI = {
  getProductBids: (productId: string) =>
    axiosInstance.get(`/bids/products/${productId}/bids`),
  placeBid: (productId: string, bidAmount: string) =>
    axiosInstance.post(`/bids/products/${productId}/bids`, { bidAmount }),
};

// Transactions API
export const transactionsAPI = {
  getMyPurchases: () => axiosInstance.get("/transactions/my-purchases"),
  getMySales: () => axiosInstance.get("/transactions/my-sales"),

  proposeMeetup: (
    transactionId: string,
    data: {
      scheduledMeetupAt: string;
      meetupLocation: string;
      meetupCoordinates: any;
    }
  ) =>
    axiosInstance.post(`/transactions/${transactionId}/propose-meetup`, data),

  acceptMeetup: (transactionId: string) =>
    axiosInstance.post(`/transactions/${transactionId}/accept-meetup`),

  markAsSold: (transactionId: string) =>
    axiosInstance.post(`/transactions/${transactionId}/mark-as-sold`),

  cancelTransaction: (
    transactionId: string,
    data: {
      reason: string;
      customReason?: string;
    }
  ) => axiosInstance.post(`/transactions/${transactionId}/cancel`, data),

  checkReviewExists: (transactionId: string) =>
    axiosInstance.get(`/transactions/${transactionId}/review-exists`),

  createReview: (transactionId: string, formData: FormData) =>
    axiosInstance.post(`/transactions/${transactionId}/review`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Location Sharing API
export const locationAPI = {
  startSharing: (conversationId: string) =>
    axiosInstance.post(`/location/${conversationId}/start`),

  stopSharing: (conversationId: string) =>
    axiosInstance.post(`/location/${conversationId}/stop`),

  updateLocation: (
    conversationId: string,
    data: { latitude: number; longitude: number }
  ) => axiosInstance.post(`/location/${conversationId}/update`, data),

  getSession: (conversationId: string) =>
    axiosInstance.get(`/location/${conversationId}/session`),
};

// Reports API
export const reportsAPI = {
  submitReport: (data: {
    reportedUserId: string;
    productId: string;
    transactionId: string;
    reportType: string;
    details?: string;
    conversationId: string;
  }) => axiosInstance.post("/reports/submit", data),

  getMyReports: () => axiosInstance.get("/reports/my-reports"),
};

// Users API
export const usersAPI = {
  getUserProfile: (userId: string) =>
    axiosInstance.get(`/users/${userId}/profile`),
  updateProfile: (data: {
    displayName?: string;
    phoneNumber?: string;
    bio?: string;
    avatarUrl?: string;
    businessDocuments?: any;
  }) => axiosInstance.put("/users/profile", data),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => axiosInstance.get("/notifications"),
  getUnreadCount: () => axiosInstance.get("/notifications/unread-count"),
  markAsRead: (notificationId: string) =>
    axiosInstance.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => axiosInstance.put("/notifications/read-all"),
  deleteNotification: (notificationId: string) =>
    axiosInstance.delete(`/notifications/${notificationId}`),
  archiveAll: () => axiosInstance.put("/notifications/archive-all"),
};

// Device Tokens API (for push notifications)
export const deviceTokensAPI = {
  register: (data: {
    expoPushToken: string;
    deviceName?: string;
    deviceType?: string;
  }) => axiosInstance.post("/device-tokens/register", data),
  unregister: (expoPushToken: string) =>
    axiosInstance.post("/device-tokens/unregister", { expoPushToken }),
  getAll: () => axiosInstance.get("/device-tokens"),
};
