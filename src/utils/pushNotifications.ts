import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { deviceTokensAPI } from "../constants/axios";

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications
 * Returns the Expo push token if successful, null otherwise
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  let token: string | null = null;

  // Only real devices can receive push notifications
  if (!Device.isDevice) {
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Ask for permission if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permission denied, return null
    if (finalStatus !== "granted") {
      return null;
    }

    // Get the Expo push token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // Make sure this is set in .env
      });
      token = tokenData.data;
    } catch (tokenError: any) {
      // Handle Firebase not initialized error (Android only)
      if (tokenError.message?.includes("FirebaseApp is not initialized")) {
        return null;
      }
      throw tokenError;
    }

    // Configure Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#16A34A",
      });
    }

    // Register token with backend
    if (token) {
      await deviceTokensAPI.register({
        expoPushToken: token,
        deviceName: Device.deviceName || undefined,
        deviceType: Platform.OS,
      });
    }

    return token;
  } catch (error) {
    return null;
  }
}

/**
 * Unregister push notifications (call on logout)
 */
export async function unregisterPushNotifications(
  token: string
): Promise<void> {
  try {
    await deviceTokensAPI.unregister(token);
  } catch (error) {}
}

/**
 * Add notification received listener
 * This is triggered when a notification is received while app is in foreground
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener
 * This is triggered when user taps on a notification
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get the last notification response (useful for handling cold start)
 */
export async function getLastNotificationResponse() {
  return await Notifications.getLastNotificationResponseAsync();
}
