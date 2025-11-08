import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertOnRegularIcon } from "../../components/icons/outline/bell-on-outline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsAPI } from "../../constants/axios";

// Types
type NotificationType = "user" | "system";

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  image_url: string;
  route_name: string | null;
  route_params: string | null;
  data: any;
  isRead: boolean;
  status: string;
  createdAt: string;
  timestamp: string; // Formatted timestamp from server
}

// Notification Icon Component
const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const getIconAndColor = () => {
    switch (type) {
      case "user":
        return { emoji: "👤", bg: "bg-primary-100" };
      case "system":
        return { emoji: "ℹ️", bg: "bg-neutral-100" };
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
        {notification.image_url ? (
          <Image
            source={{ uri: notification.image_url }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <NotificationIcon type={notification.type} />
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
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch notifications
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await notificationsAPI.getAll();
      return response.data;
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Handle pull to refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationsAPI.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to mark all as read");
    },
  });

  // Archive all notifications mutation
  const archiveAllMutation = useMutation({
    mutationFn: () => notificationsAPI.archiveAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to clear notifications");
    },
  });

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    markAsReadMutation.mutate(notification.id);

    // Navigate based on route_name
    if (notification.route_name && notification.route_params) {
      try {
        const params = JSON.parse(notification.route_params);

        // // Handle different route names
        // switch (notification.route_name) {
        //   case "chat":
        //     navigation.navigate("Messages", {
        //       screen: "ChatScreen",
        //       params: { conversationId: params.conversationId },
        //     });
        //     break;
        //   case "productDetail":
        //     navigation.navigate("ProductDetail", {
        //       productId: params.productId,
        //     });
        //     break;
        //   case "myPurchases":
        //     navigation.navigate("Profile", {
        //       screen: "MyPurchases",
        //     });
        //     break;
        //   case "myListings":
        //     navigation.navigate("Profile", {
        //       screen: "MyListings",
        //     });
        //     break;
        //   case "review":
        //     navigation.navigate("Review", {
        //       transactionId: params.transactionId,
        //     });
        //     break;
        //   case "userProfile":
        //     navigation.navigate("UserProfile", { userId: params.userId });
        //     break;
        //   default:
        // }
      } catch (err) {}
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
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
            archiveAllMutation.mutate();
          },
        },
      ]
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 border-b border-neutral-100">
          <Text className="text-2xl font-inter-bold text-primary-500">
            Notifications
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D3F81" />
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 border-b border-neutral-100">
          <Text className="text-2xl font-inter-bold text-primary-500">
            Notifications
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2">
            Failed to load notifications
          </Text>
          <Text className="text-base font-inter-regular text-neutral-500 text-center">
            Please try again later
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
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
          {notifications.map((notification: Notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(notification)}
            />
          ))}
        </ScrollView>
      ) : (
        // Empty State with pull to refresh
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
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
          <View className="flex-1 items-center justify-center px-6 pb-28">
            <View className="p-6 rounded-full items-center justify-center mb-4">
              <AlertOnRegularIcon size={110} color="#6B7280" />
            </View>
            <Text className="text-xl font-inter-bold text-neutral-800 mb-2">
              No Notifications
            </Text>
            <Text className="text-base font-inter-regular text-neutral-500 text-center">
              You're all caught up! Check back later for new updates.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
