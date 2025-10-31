import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserFavorites, useToggleFavorite } from "../../hooks/useProducts";
import { useAuthStore } from "../../store/authStore";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";
import { HeartRegularIcon } from "../../components/icons/outline/heart-outline";
import { LocationRegularIcon } from "../../components/icons/outline/location-outline";
import { HeartFilledIcon } from "../../components/icons/fill/heart-fill";

interface Product {
  id: string;
  title: string;
  price: number;
  coverImage: string;
  location: string;
  category: string;
  saleType: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
}

export default function FavoritesScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { data: favorites, isLoading, error } = useUserFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate("general", {
      screen: "productDetail",
      params: { productId },
    });
  };

  const handleToggleFavorite = (productId: string, event: any) => {
    event.stopPropagation();

    if (!user) {
      navigation.navigate("auth", { screen: "login" });
      return;
    }

    toggleFavoriteMutation.mutate(productId);
  };

  const getProductTypeBadge = (saleType: string) => {
    switch (saleType) {
      case "fixed":
        return (
          <View className="bg-primary-500 px-2 py-1 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-white">
              Buy Now
            </Text>
          </View>
        );
      case "negotiable":
        return (
          <View className="bg-warning-500 px-2 py-1 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-white">
              Negotiable
            </Text>
          </View>
        );
      case "bidding":
        return (
          <View className="bg-success-500 px-2 py-1 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-white">
              Bidding
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => handleProductPress(item.id)}
      className="w-[48%] bg-white rounded-2xl overflow-hidden shadow-sm mb-4"
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View className="w-full h-48 bg-neutral-200 relative">
        <Image
          source={{ uri: item.coverImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Category Badge */}
        <View className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded-lg max-w-24">
          <Text
            className="text-xs font-inter-medium text-white truncate"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {item.category}
          </Text>
        </View>
        {/* Sale Type Badge */}
        <View className="absolute top-2 right-2">
          {getProductTypeBadge(item.saleType)}
        </View>
        {/* Favorite Button */}
        <TouchableOpacity
          onPress={(e) => handleToggleFavorite(item.id, e)}
          className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
          activeOpacity={0.7}
        >
          <HeartFilledIcon size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View className="p-3">
        {/* Title */}
        <Text
          className="text-sm font-inter-semiBold text-neutral-900 mb-2"
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Price */}
        <Text className="text-lg font-inter-bold text-primary-500 mb-2">
          ₱{item.price.toLocaleString()}
        </Text>

        {/* Location */}
        <View className="flex-row items-center mb-2 gap-1">
          <LocationRegularIcon color="#6B7280" size={16} />
          <Text
            className="text-xs font-inter-regular text-neutral-500 flex-1"
            numberOfLines={1}
          >
            {item.location}
          </Text>
        </View>

        {/* Seller Info */}
        <View className="flex-row items-center">
          {item.seller.avatar ? (
            <Image
              source={{ uri: item.seller.avatar }}
              className="w-6 h-6 rounded-full mr-2"
            />
          ) : (
            <View className="w-6 h-6 rounded-full mr-2 bg-primary-100 items-center justify-center">
              <Text className="text-xs font-inter-medium text-primary-500">
                {item.seller.name.charAt(0)}
              </Text>
            </View>
          )}
          <Text
            className="text-xs font-inter-regular text-neutral-600 flex-1"
            numberOfLines={1}
          >
            {item.seller.name}
          </Text>
          {item.seller.verified && (
            <View className="bg-success-100 px-1.5 py-0.5 rounded-full">
              <Text className="text-xs font-inter-semiBold text-success-700">
                ✓
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Not logged in state
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 bg-white border-b border-neutral-100">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-inter-bold text-primary-500 text-center mr-10">
            My Favorites
          </Text>
        </View>

        {/* Not Logged In Message */}
        <View className="flex-1 items-center justify-center px-6">
          <HeartRegularIcon size={64} color="#D1D5DB" />
          <Text className="text-xl font-inter-bold text-neutral-900 mt-6 mb-2">
            Login Required
          </Text>
          <Text className="text-base font-inter-regular text-neutral-600 text-center mb-6">
            Please login to view your favorite items
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("auth", { screen: "login" })}
            className="px-6 py-3 rounded-xl bg-primary-500"
          >
            <Text className="text-base font-inter-semiBold text-white">
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 bg-white border-b border-neutral-100">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-inter-bold text-primary-500 text-center mr-10">
            My Favorites
          </Text>
        </View>

        {/* Loading */}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D3F81" />
          <Text className="text-base font-inter-regular text-neutral-600 mt-4">
            Loading your favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 bg-white border-b border-neutral-100">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-inter-bold text-primary-500 text-center mr-10">
            My Favorites
          </Text>
        </View>

        {/* Error Message */}
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-inter-bold text-neutral-900 mb-2">
            Something went wrong
          </Text>
          <Text className="text-base font-inter-regular text-neutral-600 text-center mb-6">
            Unable to load your favorites. Please try again.
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="px-6 py-3 rounded-xl bg-primary-500"
          >
            <Text className="text-base font-inter-semiBold text-white">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!favorites || favorites.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 bg-white border-b border-neutral-100">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-inter-bold text-primary-500 text-center mr-10">
            My Favorites
          </Text>
        </View>

        {/* Empty State */}
        <View className="flex-1 items-center justify-center px-6">
          <HeartRegularIcon size={64} color="#D1D5DB" />
          <Text className="text-xl font-inter-bold text-neutral-900 mt-6 mb-2">
            No Favorites Yet
          </Text>
          <Text className="text-base font-inter-regular text-neutral-600 text-center mb-6">
            Start exploring and save items you love by tapping the heart icon
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("tabs", { screen: "home" })}
            className="px-6 py-3 rounded-xl bg-primary-500"
          >
            <Text className="text-base font-inter-semiBold text-white">
              Browse Products
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main content with favorites
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-neutral-100">
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeftOutlineIcon size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-inter-bold text-primary-500 text-center mr-10">
          My Favorites
        </Text>
      </View>

      {/* Favorites Count */}
      <View className="px-6 py-3 bg-white">
        <Text className="text-sm font-inter-regular text-neutral-600">
          {favorites.length} {favorites.length === 1 ? "item" : "items"} saved
        </Text>
      </View>

      {/* Products Grid */}
      <FlatList
        data={favorites}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        className="bg-neutral-50"
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
