import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";
import { HeartRegularIcon } from "../../components/icons/outline/heart-outline";
import { ShoppingBagRegularIcon } from "../../components/icons/outline/shop-bag-outline";
import { PersonOutlineIcon } from "../../components/icons/outline/person-outline";
import { SettingsRegularIcon } from "../../components/icons/outline/setting-outline";
import { BuildingShopRegularIcon } from "../../components/icons/outline/shop-outline";
import { ChevronRightRegularIcon } from "../../components/icons/outline/chevron-outline";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onPress,
  showChevron = true,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 px-5 bg-white border-b border-neutral-100"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center">
        {icon}
      </View>
      <Text className="flex-1 ml-4 text-base font-inter-medium text-neutral-800">
        {label}
      </Text>
      {showChevron && <ChevronRightRegularIcon size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );
};

export default function AccountScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  // Handlers
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleLogin = () => {
    navigation.navigate("auth", {
      screen: "login",
    });
  };

  const handleRegister = () => {
    navigation.navigate("auth", {
      screen: "register",
    });
  };

  const handleVerifyIdentity = () => {
    navigation.navigate("general", { screen: "identityVerification" });
  };

  const handleMyFavorites = () => {
    Alert.alert("My Favorites", "View your saved items");
    // TODO: Navigate to favorites screen
  };

  const handleMyPurchases = () => {
    navigation.navigate("general", { screen: "myPurchases" });
  };

  const handleEditProfile = () => {
    navigation.navigate("general", { screen: "editProfile" });
  };

  const handleSettings = () => {
    navigation.navigate("general", { screen: "settings" });
  };

  const handleMyListings = () => {
    navigation.navigate("general", { screen: "myListings" });
  };

  // Unauthenticated State
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
        <ScrollView
          contentContainerClassName="flex-grow"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-8 pb-8">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-3xl font-inter-bold text-primary-500 mb-2">
                Account
              </Text>
              <Text className="text-base font-inter-regular text-neutral-600">
                Sign in to access your profile and manage your account
              </Text>
            </View>

            {/* Default Avatar */}
            <View className="items-center mb-8">
              <View className="w-24 h-24 rounded-full bg-neutral-200 items-center justify-center mb-4">
                <PersonOutlineIcon size={48} color="#6B7280" />
              </View>
              <Text className="text-lg font-inter-semiBold text-neutral-800">
                Guest User
              </Text>
              <Text className="text-sm font-inter-regular text-neutral-500 mt-1">
                Login to personalize your experience
              </Text>
            </View>

            {/* Login/Register Buttons */}
            <View className="mb-8">
              <TouchableOpacity
                onPress={handleLogin}
                className="w-full py-4 rounded-xl bg-primary-500 mb-4 active:bg-primary-600"
              >
                <Text className="text-center text-white text-base font-inter-semiBold">
                  Log In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRegister}
                className="w-full py-4 rounded-xl border-2 border-primary-500 bg-white active:bg-neutral-50"
              >
                <Text className="text-center text-primary-500 text-base font-inter-semiBold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Limited Menu Items */}
            <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <MenuItem
                icon={<SettingsRegularIcon size={20} color="#6B7280" />}
                label="Settings"
                onPress={handleSettings}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Authenticated State
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="flex-grow"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 pb-8">
          {/* Header */}
          <View className="px-6 pb-6 bg-white">
            <Text className="text-3xl font-inter-bold text-primary-500 mb-2">
              Account
            </Text>
            <Text className="text-base font-inter-regular text-neutral-600">
              Manage your profile and preferences
            </Text>
          </View>

          {/* User Profile Section */}
          <View className="px-6 py-6 bg-white mb-4">
            <View className="flex-row items-center">
              {/* Avatar */}
              <View className="mr-4">
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center">
                    <Text className="text-2xl font-inter-bold text-primary-500">
                      {user.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* User Info */}
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-xl font-inter-bold text-neutral-900 mr-2">
                    {user.displayName}
                  </Text>
                  {user.identityVerified && (
                    <View className="bg-primary-500 px-2 py-1 rounded-full">
                      <Text className="text-xs font-inter-semiBold text-white">
                        ✓ Verified
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm font-inter-regular text-neutral-600">
                  {user.email}
                </Text>
                {/* {user.emailVerified && (
                  <View className="flex-row items-center mt-1">
                    <View className="w-1.5 h-1.5 rounded-full bg-success-500 mr-1.5" />
                    <Text className="text-xs font-inter-regular text-neutral-500">
                      Email verified
                    </Text>
                  </View>
                )} */}
              </View>
            </View>
          </View>

          {/* Identity Verification Prompt (if not verified) */}
          {!user.identityVerified && (
            <View className="mx-6 mb-4 p-4 bg-warning-50 border border-warning-200 rounded-2xl">
              <View className="flex-row items-start">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-inter-semiBold text-warning-900 mb-1">
                    Verify Your Identity
                  </Text>
                  <Text className="text-sm font-inter-regular text-warning-800 mb-3">
                    Get verified to sell items and build trust with buyers
                  </Text>
                  <TouchableOpacity
                    onPress={handleVerifyIdentity}
                    className="self-start px-4 py-2 bg-warning-500 rounded-lg active:bg-warning-600"
                  >
                    <Text className="text-sm font-inter-semiBold text-white">
                      Verify Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Menu Items */}
          <View className="mx-6 bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
            <MenuItem
              icon={<ShoppingBagRegularIcon size={20} color="#6B7280" />}
              label="My Purchases"
              onPress={handleMyPurchases}
            />
            <MenuItem
              icon={<PersonOutlineIcon size={20} color="#6B7280" />}
              label="Edit Profile"
              onPress={handleEditProfile}
            />
            {user.identityVerified && (
              <MenuItem
                icon={<BuildingShopRegularIcon size={20} color="#6B7280" />}
                label="My Listings"
                onPress={handleMyListings}
              />
            )}
            <MenuItem
              icon={<SettingsRegularIcon size={20} color="#6B7280" />}
              label="Settings"
              onPress={handleSettings}
            />
          </View>

          {/* Logout Button */}
          <View className="px-6">
            <TouchableOpacity
              onPress={handleLogout}
              className="w-full py-4 rounded-xl bg-neutral-200 active:bg-neutral-300"
            >
              <Text className="text-center text-neutral-800 text-base font-inter-semiBold">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
