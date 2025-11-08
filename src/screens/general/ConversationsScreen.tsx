import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchRegularIcon } from "../../components/icons/outline/search-outline";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";
import { useConversations } from "../../hooks/useMessages";
import { ChatRegularIcon } from "../../components/icons/outline/chat-outline";
import { formatMessageTime } from "../../utils/dateHelpers";
import { CheckmarkCircleRegularIcon } from "../../components/icons/outline/check-mark-outline";

// Types
interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
  product?: {
    id: string;
    title: string;
    image: string;
  };
}

// Mock Conversations Data
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    user: {
      id: "u1",
      name: "Emma Wilson",
      avatar: "https://i.pravatar.cc/150?img=45",
      verified: true,
    },
    lastMessage: {
      text: "Is this still available? I'm interested in buying.",
      timestamp: "5m ago",
      isRead: false,
      senderId: "u1",
    },
    unreadCount: 3,
    product: {
      id: "p1",
      title: "Vintage Leather Jacket",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    },
  },
  {
    id: "2",
    user: {
      id: "u2",
      name: "John Smith",
      avatar: "https://i.pravatar.cc/150?img=12",
      verified: true,
    },
    lastMessage: {
      text: "Great! I'll send you my shipping address.",
      timestamp: "1h ago",
      isRead: false,
      senderId: "u2",
    },
    unreadCount: 1,
    product: {
      id: "p2",
      title: "iPhone 14 Pro Max",
      image:
        "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400",
    },
  },
  {
    id: "3",
    user: {
      id: "u3",
      name: "Mike Chen",
      avatar: "https://i.pravatar.cc/150?img=33",
      verified: true,
    },
    lastMessage: {
      text: "Thanks for the quick response!",
      timestamp: "2h ago",
      isRead: true,
      senderId: "u3",
    },
    unreadCount: 0,
    product: {
      id: "p3",
      title: "Gaming Setup - RTX 4090",
      image:
        "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400",
    },
  },
  {
    id: "4",
    user: {
      id: "u4",
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=25",
      verified: false,
    },
    lastMessage: {
      text: "Can you do $700 for the sofa?",
      timestamp: "3h ago",
      isRead: true,
      senderId: "u4",
    },
    unreadCount: 0,
    product: {
      id: "p4",
      title: "Modern Sofa Set",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    },
  },
  {
    id: "5",
    user: {
      id: "u5",
      name: "David Martinez",
      avatar: "https://i.pravatar.cc/150?img=51",
      verified: true,
    },
    lastMessage: {
      text: "Perfect condition! When can I pick it up?",
      timestamp: "1d ago",
      isRead: true,
      senderId: "u5",
    },
    unreadCount: 0,
    product: {
      id: "p5",
      title: "Mountain Bike",
      image:
        "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400",
    },
  },
  {
    id: "6",
    user: {
      id: "u6",
      name: "Lisa Anderson",
      avatar: "https://i.pravatar.cc/150?img=48",
      verified: true,
    },
    lastMessage: {
      text: "I'll take it! Payment sent.",
      timestamp: "2d ago",
      isRead: true,
      senderId: "u6",
    },
    unreadCount: 0,
    product: {
      id: "p6",
      title: "Designer Watch",
      image:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400",
    },
  },
];

// Conversation Item Component
const ConversationItem: React.FC<{
  conversation: Conversation;
  onPress: () => void;
}> = ({ conversation, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row p-4 border-b border-neutral-100 ${
        conversation.unreadCount > 0 ? "bg-primary-50/30" : "bg-white"
      }`}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View className="relative mr-3">
        {conversation.user.avatar ? (
          <Image
            source={{ uri: conversation.user.avatar }}
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-primary-100 items-center justify-center">
            <Text className="text-2xl font-inter-bold text-primary-500">
              {conversation.user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {conversation.unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-primary-500 rounded-full items-center justify-center px-1.5">
            <Text className="text-xs font-inter-bold text-white">
              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        {/* User Info */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1">
            <Text
              className={`text-base ${
                conversation.unreadCount > 0
                  ? "font-inter-semiBold text-neutral-900"
                  : "font-inter-medium text-neutral-800"
              } mr-2`}
              numberOfLines={1}
            >
              {conversation.user.name}
            </Text>
            {conversation.user.verified && (
              <CheckmarkCircleRegularIcon color="#10B981" size={18} />
            )}
          </View>
          <Text className="text-xs font-inter-regular text-neutral-500 ml-2">
            {formatMessageTime(conversation.lastMessage.timestamp)}
          </Text>
        </View>

        {/* Last Message */}
        <Text
          className={`text-sm ${
            conversation.unreadCount > 0
              ? "font-inter-medium text-neutral-700"
              : "font-inter-regular text-neutral-600"
          } mb-2`}
          numberOfLines={1}
        >
          {conversation.lastMessage.text}
        </Text>

        {/* Product Info */}
        {conversation.product && (
          <View className="flex-row items-center p-2 bg-neutral-50 rounded-lg">
            <Image
              source={{ uri: conversation.product.image }}
              className="w-10 h-10 rounded-lg mr-2"
            />
            <Text
              className="flex-1 text-xs font-inter-medium text-neutral-700"
              numberOfLines={1}
            >
              {conversation.product.title}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ConversationsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch conversations using TanStack Query
  const {
    data: conversationsData,
    isLoading,
    error,
    refetch,
  } = useConversations();

  // Refresh handler
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Transform backend data to UI format
  const conversations: Conversation[] =
    conversationsData?.map((conv) => ({
      id: conv.id,
      user: {
        id: conv.oppositeUser?.id || "unknown",
        name: conv.oppositeUser?.displayName || "Unknown User",
        avatar: conv.oppositeUser?.avatarUrl || "",
        verified: conv.oppositeUser?.identityVerified || false,
      },
      lastMessage: {
        text: conv.lastMessage?.content || "No messages yet",
        timestamp: conv.lastMessage?.createdAt
          ? conv.lastMessage.createdAt
          : "",
        isRead: conv.unreadMessageCount === 0,
        senderId: "", // Not provided by backend for now
      },
      unreadCount: conv.unreadMessageCount || 0,
      product: conv.product
        ? {
            id: conv.product.id,
            title: conv.product.title,
            image: conv.product.imageUrl || "https://via.placeholder.com/100",
          }
        : undefined,
    })) || [];

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count total unread messages
  const totalUnread = conversations.reduce(
    (acc, conv) => acc + conv.unreadCount,
    0
  );

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate("general", {
      screen: "chat",
      params: { conversationId: conversation.id },
    } as never);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-neutral-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center mr-3"
              activeOpacity={0.7}
            >
              <ArrowLeftOutlineIcon size={20} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-inter-bold text-primary-500">
                Messages
              </Text>
              {totalUnread > 0 && (
                <Text className="text-sm font-inter-regular text-neutral-600">
                  {totalUnread} unread message{totalUnread !== 1 ? "s" : ""}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="relative">
          <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <SearchRegularIcon size={20} color="#6B7280" />
          </View>
          <TextInput
            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-inter-regular text-neutral-900 text-base"
            placeholder="Search conversations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Conversations List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D3F81" />
          <Text className="text-base font-inter-medium text-neutral-600 mt-4">
            Loading conversations...
          </Text>
        </View>
      ) : filteredConversations.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0D3F81"]}
              tintColor="#0D3F81"
            />
          }
        >
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              onPress={() => handleConversationPress(conversation)}
            />
          ))}
        </ScrollView>
      ) : (
        // Empty State
        <View className="flex-1 items-center justify-center px-6 pb-48">
          {searchQuery ? (
            // No Search Results
            <>
              <SearchRegularIcon size={110} color="#9CA3AF" />
              <Text className="text-xl font-inter-bold text-neutral-800 mb-2">
                No conversations found
              </Text>
              <Text className="text-base font-inter-regular text-neutral-500 text-center">
                Try searching with a different name
              </Text>
            </>
          ) : (
            // No Conversations Yet
            <>
              {/* Gray chat icon */}
              <ChatRegularIcon size={110} color="#9CA3AF" />
              <Text className="text-xl font-inter-bold text-neutral-800 mb-2 mt-6">
                No Messages Yet
              </Text>
              <Text className="text-base font-inter-regular text-neutral-500 text-center mb-6">
                Start browsing products and connect with sellers
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Browse", "Navigate to home screen");
                  // TODO: Navigate to home/browse screen
                }}
                className="px-6 py-3 bg-primary-500 rounded-xl active:bg-primary-600"
              >
                <Text className="text-base font-inter-semiBold text-white">
                  Browse Products
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}
