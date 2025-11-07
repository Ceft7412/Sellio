import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesAPI } from "../constants/axios";
import { useEffect, useState } from "react";
import { useSocket } from "../providers/SocketProvider";

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  productId: string | null;
  offerId?: string | null;
  buyId?: string | null;
  bidId?: string | null;
  createdAt: string;
  updatedAt: string;
  unreadMessageCount?: number;
  oppositeUser: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    identityVerified: boolean;
  } | null;
  lastMessage?: {
    createdAt: string | null;
    content: string;
  } | null;
  product: {
    id: string;
    title: string;
    price?: string;
    imageUrl: string | null;
  } | null;
  offer?: {
    id: string;
    amount: string;
    status: "pending" | "accepted" | "rejected" | "expired" | "withdrawn";
    buyerId: string;
    sellerId: string;
  } | null;
  buy?: {
    id: string;
    amount: string;
    status: "pending" | "confirmed_pending_meetup" | "cancelled_by_buyer" | "cancelled_by_seller" | "expired" | "completed";
    buyerId: string;
    sellerId: string;
  } | null;
  bid?: {
    id: string;
    bidAmount: string;
    status: "active" | "won" | "lost" | "outbid" | "expired" | "completed";
    bidderId: string;
    productId: string;
  } | null;
  transaction?: {
    id: string;
    status: string;
    meetupStatus: string;
    scheduledMeetupAt: string | null;
    meetupLocation: string | null;
    meetupCoordinates: any;
    meetupProposedBy: string | null;
    agreedPrice: string;
    buyerId: string;
    sellerId: string;
  } | null;
}

interface ConversationsResponse {
  message: string;
  conversations: Conversation[];
  count: number;
}

interface ConversationResponse {
  message: string;
  conversation: Conversation;
}

// Fetch all conversations for the current user
export const useConversations = () => {
  return useQuery<Conversation[] | undefined>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await messagesAPI.getConversations();
      const data: ConversationsResponse = response.data;
      return data.conversations || [];
    },
  });
};

// Fetch single conversation by ID
export const useConversation = (conversationId: string) => {
  return useQuery<Conversation>({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const response = await messagesAPI.getConversation(conversationId);
      const data: ConversationResponse = response.data;
      return data.conversation;
    },
    enabled: !!conversationId,
  });
};

// Create conversation mutation
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      participant2Id: string;
      productId?: string;
    }) => {
      const response = await messagesAPI.createNormalConversation(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Create negotiable conversation mutation (with automatic offer message)
export const useCreateNegotiableConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      participant2Id: string;
      productId: string;
      offerPrice: string;
    }) => {
      const response = await messagesAPI.createNegotiableConversation(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Create buy conversation mutation (with automatic buy message)
export const useCreateBuyConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      participant2Id: string;
      productId: string;
      productTitle: string;
    }) => {
      const response = await messagesAPI.createBuyConversation(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Hook to track total unread message count with real-time updates
export const useUnreadMessagesCount = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  // Fetch conversations to get initial unread count
  const { data: conversations } = useConversations();

  // Calculate total unread count from conversations
  const unreadCount =
    conversations?.reduce(
      (total, conv) => total + (conv.unreadMessageCount || 0),
      0
    ) || 0;

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = () => {
      // Invalidate conversations to refetch and update unread count
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    // Listen for messages being marked as read
    const handleMessagesRead = () => {
      // Invalidate conversations to refetch and update unread count
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, queryClient]);

  return unreadCount;
};

// Hook to mark messages as read when conversation is opened
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await messagesAPI.markMessagesAsRead(conversationId);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate conversations to update unread counts
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Message interface
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  imageUrl?: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface MessagesResponse {
  message: string;
  messages: Message[];
  count: number;
}

// Fetch messages for a conversation
export const useMessages = (conversationId: string) => {
  return useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const response = await messagesAPI.getMessages(conversationId);
      const data: MessagesResponse = response.data;
      return data.messages;
    },
    enabled: !!conversationId,
  });
};

// Send a message mutation
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      conversationId: string;
      content: string;
      messageType?: string;
      imageUrl?: string;
    }) => {
      const response = await messagesAPI.sendMessage(data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
