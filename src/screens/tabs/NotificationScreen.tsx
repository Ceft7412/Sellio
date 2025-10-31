import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertOnRegularIcon } from "../../components/icons/outline/bell-on-outline";

// Types
type NotificationType =
  | "order"
  | "message"
  | "bid"
  | "offer"
  | "system"
  | "favorite";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  image?: string;
  actionUrl?: string;
}

// Mock Notifications Data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "bid",
    title: "New Bid on Your Item",
    message: "John Smith placed a bid of $3,400 on Gaming Setup - RTX 4090",
    timestamp: "5 minutes ago",
    isRead: false,
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "2",
    type: "message",
    title: "New Message",
    message: "Emma Wilson sent you a message about Vintage Leather Jacket",
    timestamp: "1 hour ago",
    isRead: false,
    image: "https://i.pravatar.cc/150?img=45",
  },
  {
    id: "3",
    type: "offer",
    title: "Offer Accepted",
    message: "Your offer of $250 for Vintage Leather Jacket was accepted!",
    timestamp: "2 hours ago",
    isRead: false,
  },
  {
    id: "4",
    type: "order",
    title: "Order Delivered",
    message: "Your order for iPhone 14 Pro Max has been delivered",
    timestamp: "3 hours ago",
    isRead: true,
  },
  {
    id: "5",
    type: "favorite",
    title: "Price Drop Alert",
    message: "Mountain Bike - Trek X you favorited dropped to $400",
    timestamp: "5 hours ago",
    isRead: true,
    image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400",
  },
  {
    id: "6",
    type: "system",
    title: "Identity Verification Complete",
    message:
      "Your identity has been verified! You can now list items for sale.",
    timestamp: "1 day ago",
    isRead: true,
  },
  {
    id: "7",
    type: "bid",
    title: "Outbid Alert",
    message: "Someone outbid you on Designer Watch Collection",
    timestamp: "1 day ago",
    isRead: true,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400",
  },
  {
    id: "8",
    type: "message",
    title: "New Message",
    message: "Mike Chen asked about product availability",
    timestamp: "2 days ago",
    isRead: true,
    image: "https://i.pravatar.cc/150?img=33",
  },
];

// Notification Icon Component
const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const getIconAndColor = () => {
    switch (type) {
      case "order":
        return { emoji: "📦", bg: "bg-primary-100" };
      case "message":
        return { emoji: "💬", bg: "bg-secondary-100" };
      case "bid":
        return { emoji: "⚡", bg: "bg-warning-100" };
      case "offer":
        return { emoji: "🤝", bg: "bg-success-100" };
      case "system":
        return { emoji: "ℹ️", bg: "bg-neutral-100" };
      case "favorite":
        return { emoji: "❤️", bg: "bg-error-100" };
      default:
        return { emoji: "🔔", bg: "bg-neutral-100" };
    }
  };

  const { emoji, bg } = getIconAndColor();

  return (
    <View
      className={`w-12 h-12 rounded-full ${bg} items-center justify-center`}
    >
      <Text className="text-xl">{emoji}</Text>
    </View>
  );
};

// Notification Item Component
const NotificationItem: React.FC<{
  notification: Notification;
  onPress: () => void;
}> = ({ notification, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row p-4 border-b border-neutral-100 ${
        notification.isRead ? "bg-white" : "bg-primary-50/30"
      }`}
      activeOpacity={0.7}
    >
      {/* Icon or Image */}
      <View className="mr-3">
        {notification.image ? (
          <Image
            source={{ uri: notification.image }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <NotificationIcon type={notification.type} />
        )}
        {/* Unread Indicator */}
        {!notification.isRead && (
          <View className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className={`text-sm ${
            notification.isRead
              ? "font-inter-medium text-neutral-800"
              : "font-inter-semiBold text-neutral-900"
          } mb-1`}
        >
          {notification.title}
        </Text>
        <Text
          className="text-sm font-inter-regular text-neutral-600 mb-2"
          numberOfLines={2}
        >
          {notification.message}
        </Text>
        <Text className="text-xs font-inter-regular text-neutral-400">
          {notification.timestamp}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationScreen({ navigation }: any) {
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    Alert.alert("Notification", `Navigate to: ${notification.title}`);
    // TODO: Navigate to relevant screen based on notification type
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    Alert.alert("Success", "All notifications marked as read");
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            setNotifications([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-neutral-100">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-inter-bold text-primary-500">
            Notifications
          </Text>
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              className="px-3 py-1.5 rounded-lg bg-neutral-100"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-inter-semiBold text-neutral-700">
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Unread Count & Mark All Read */}
        {unreadCount > 0 && (
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-inter-regular text-neutral-600">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </Text>
            <TouchableOpacity onPress={handleMarkAllAsRead} activeOpacity={0.7}>
              <Text className="text-sm font-inter-semiBold text-primary-500">
                Mark all as read
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(notification)}
            />
          ))}
        </ScrollView>
      ) : (
        // Empty State
        <View className="flex-1 items-center justify-center px-6">
          <View className="p-6 rounded-full bg-neutral-100 items-center justify-center mb-4">
            <AlertOnRegularIcon size={110} color="#6B7280" />
          </View>
          <Text className="text-xl font-inter-bold text-neutral-800 mb-2">
            No Notifications
          </Text>
          <Text className="text-base font-inter-regular text-neutral-500 text-center">
            You're all caught up! Check back later for new updates.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
