import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Dimensions,
  Share,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";
import { HeartRegularIcon } from "../../components/icons/outline/heart-outline";
import { ChatRegularIcon } from "../../components/icons/outline/chat-outline";
import { ShareIosRegularIcon } from "../../components/icons/outline/share-outline";
import { LocationRegularIcon } from "../../components/icons/outline/location-outline";
import { StarColorIcon } from "../../components/icons/fill/star-color-fill";
import { useAuthStore } from "../../store/authStore";
import { useProductById, useToggleFavorite } from "../../hooks/useProducts";
import { toTitleCase, normalizeObject } from "../../utils/textHelpers";
import {
  useCreateConversation,
  useCreateNegotiableConversation,
  useCreateBuyConversation,
} from "../../hooks/useMessages";
import { ProductDetailsLoadingState } from "../../components/states/loading";
import { HeartFilledIcon } from "../../components/icons/fill/heart-fill";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

const { width } = Dimensions.get("window");

// Types
type ProductType = "direct_buy" | "negotiable" | "bidding";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  type: ProductType;
  category: string;
  location: string;
  description: string;
  condition: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    rating: number;
    totalSales: number;
  };
  currentBid?: number;
  minimumBid?: number;
  bidCount?: number;
  endTime?: string;
  specs?: { [key: string]: string };
}

// Mock Product Data
const MOCK_PRODUCT: Product = {
  id: "1",
  title: "Gaming Setup - RTX 4090 Complete Build",
  price: 3500,
  images: [
    "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800",
    "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800",
    "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=800",
    "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800",
  ],
  type: "bidding", // Change to "direct_buy" or "negotiable" to see different UIs
  category: "Electronics",
  location: "Austin, TX",
  condition: "Like New",
  description:
    "Complete high-end gaming setup featuring NVIDIA RTX 4090, Intel i9-13900K, 64GB DDR5 RAM, and 2TB NVMe SSD. Includes RGB lighting, custom water cooling, and premium peripherals. Perfect for 4K gaming and content creation. Barely used, in excellent condition.",
  currentBid: 3200,
  minimumBid: 100,
  bidCount: 12,
  endTime: "2h 34m remaining",
  seller: {
    id: "s1",
    name: "Mike Chen",
    avatar: "https://i.pravatar.cc/150?img=33",
    verified: true,
    rating: 4.8,
    totalSales: 45,
  },
  specs: {
    GPU: "NVIDIA RTX 4090",
    CPU: "Intel i9-13900K",
    RAM: "64GB DDR5",
    Storage: "2TB NVMe SSD",
    Cooling: "Custom Water Loop",
  },
};

export default function ProductDetailsScreen({ navigation, route }: any) {
  const { user } = useAuthStore();

  // Get product ID from route params
  const productId = route?.params?.productId;

  // Fetch product data using TanStack Query
  const { data: productData, isLoading, error, refetch } = useProductById(productId);

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Create conversation mutations for different types
  const createConversationMutation = useCreateConversation();
  const createNegotiableMutation = useCreateNegotiableConversation();
  const createBuyMutation = useCreateBuyConversation();

  // Favorite mutation
  const toggleFavoriteMutation = useToggleFavorite();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Get favorite status from backend data
  const isFavorite = productData?.isFavorited || false;

  // Transform backend data to UI format
  const product: Product | null = productData
    ? {
        id: productData.id,
        title: productData.title,
        price: parseFloat(productData.price),
        images: productData.images?.map((img: any) => img.url) || [],
        type:
          productData.saleType === "fixed"
            ? "direct_buy"
            : productData.saleType === "negotiable"
            ? "negotiable"
            : "bidding",
        category:
          productData.subCategory?.name ||
          productData.category?.name ||
          "Unknown",
        location: productData.location || "Location not specified",
        description: productData.description,
        condition: toTitleCase(productData.condition || ""), // Normalize condition: like_new -> Like New
        seller: {
          id: productData.seller?.id || "unknown",
          name: productData.seller?.displayName || "Anonymous Seller",
          avatar: productData.seller?.avatarUrl,
          verified: productData.seller?.identityVerifiedAt !== null,
          rating: productData.seller?.sellerRating || 0, // Real seller rating from reviews
          totalSales: 0, // TODO: Add real sales count
        },
        currentBid: productData.minimumBid
          ? parseFloat(productData.minimumBid)
          : undefined,
        minimumBid: productData.minimumBid
          ? parseFloat(productData.minimumBid)
          : undefined,
        bidCount: 0, // TODO: Fetch actual bid count
        endTime: productData.biddingEndsAt || undefined,
        specs: productData.attributes
          ? normalizeObject(productData.attributes)
          : undefined, // Normalize specs: shoe_type -> Shoe Type
      }
    : null;

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleFavorite = () => {
    if (!user) {
      navigation.navigate("auth", { screen: "login" });
      return;
    }

    if (!productId) {
      Alert.alert("Error", "Unable to favorite this product");
      return;
    }

    toggleFavoriteMutation.mutate(productId, {
      onSuccess: (data) => {},
      onError: (error: any) => {},
    });
  };

  const handleShare = async () => {
    if (!product) {
      Alert.alert("Error", "Unable to share product");
      return;
    }

    try {
      // Create share message with product details
      const shareMessage = `🛍️ Check out this ${product.type === "bidding" ? "auction" : "item"} on Sellio!

📦 ${product.title}
💰 Price: ₱${product.price.toLocaleString()}
📍 Location: ${product.location}
✨ Condition: ${product.condition}

${product.description.substring(0, 150)}${product.description.length > 150 ? "..." : ""}

${product.seller.verified ? "✅ Verified Seller" : ""}
${product.seller.rating > 0 ? `⭐ ${product.seller.rating.toFixed(1)} Rating` : ""}

View full details on Sellio app!`;

      // For iOS and Android, use native Share API
      if (Platform.OS === "ios" || Platform.OS === "android") {
        const result = await Share.share(
          {
            message: shareMessage,
            title: `${product.title} - Sellio`,
            // Note: iOS doesn't support url separately from message
            // You can add a product URL here if you have deep linking set up
          },
          {
            // iOS only options
            subject: `Check out ${product.title} on Sellio`,
            dialogTitle: "Share this product",
          }
        );

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // Shared with activity type of result.activityType
            console.log("Shared via:", result.activityType);
          } else {
            // Shared successfully
            console.log("Product shared successfully");
          }
        } else if (result.action === Share.dismissedAction) {
          // Share dismissed
          console.log("Share dismissed");
        }
      } else {
        // Fallback for web or other platforms
        Alert.alert("Share", shareMessage);
      }

      // Optional: Share with image (more advanced)
      // This requires downloading the image first
      // Uncomment to enable image sharing:
      /*
      if (await Sharing.isAvailableAsync()) {
        await shareWithImage();
      }
      */
    } catch (error: any) {
      console.error("Error sharing product:", error);
      Alert.alert("Error", "Failed to share product. Please try again.");
    }
  };

  // Advanced sharing with image (optional)
  const shareWithImage = async () => {
    if (!product?.images || product.images.length === 0) {
      return;
    }

    try {
      // Download the first product image
      const imageUri = product.images[0];
      const fileUri = `${FileSystem.cacheDirectory}product-${product.id}.jpg`;

      // Download image to local cache
      const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);

      if (downloadResult.status === 200) {
        // Share the image with caption
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: "image/jpeg",
          dialogTitle: `Share ${product.title}`,
          UTI: "public.jpeg", // iOS Universal Type Identifier
        });
      }
    } catch (error) {
      console.error("Error sharing with image:", error);
      // Fallback to text-only share if image share fails
      throw error;
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      navigation.navigate("auth", { screen: "login" });
      return;
    }

    if (!product?.seller.id || !product?.id) {
      Alert.alert("Error", "Unable to contact seller");
      return;
    }

    try {
      // Create or get existing conversation
      const result = await createConversationMutation.mutateAsync({
        participant2Id: product.seller.id,
        productId: product.id,
      });

      // Navigate to chat screen with conversationId
      navigation.navigate("general", {
        screen: "chat",
        params: { conversationId: result.conversation.id },
      } as never);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to start conversation"
      );
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigation.navigate("auth", { screen: "login" });
      return;
    }

    if (!product?.seller.id || !product?.id || !product?.title) {
      Alert.alert("Error", "Unable to proceed");
      return;
    }

    try {
      // Create buy conversation with automatic message
      const result = await createBuyMutation.mutateAsync({
        participant2Id: product.seller.id,
        productId: product.id,
        productTitle: product.title,
      });

      // Navigate to chat screen
      navigation.navigate("general", {
        screen: "chat",
        params: { conversationId: result.conversation.id },
      } as never);
    } catch (error: any) {
      console.error("Error creating buy conversation:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to start conversation"
      );
    }
  };

  const handleMakeOffer = async () => {
    if (!user) {
      navigation.navigate("auth", { screen: "login" });
      return;
    }
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid offer amount");
      return;
    }

    if (!product?.seller.id || !product?.id) {
      Alert.alert("Error", "Unable to proceed");
      return;
    }

    try {
      // Create negotiable conversation with automatic offer message
      const result = await createNegotiableMutation.mutateAsync({
        participant2Id: product.seller.id,
        productId: product.id,
        offerPrice: offerAmount,
      });

      // Navigate to chat screen
      navigation.navigate("general", {
        screen: "chat",
        params: { conversationId: result.conversation.id },
      } as never);

      setOfferAmount("");
    } catch (error: any) {
      console.error("Error creating negotiable conversation:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to send offer"
      );
    }
  };

  const handlePlaceBid = () => {
    if (!user) {
      navigation.navigate("auth", { screen: "login" });
      return;
    }
    if (
      !bidAmount ||
      isNaN(parseFloat(bidAmount)) ||
      parseFloat(bidAmount) <= 0
    ) {
      Alert.alert("Error", "Please enter a valid bid amount");
      return;
    }

    if (!product) {
      Alert.alert("Error", "Product information unavailable");
      return;
    }

    const bidValue = parseFloat(bidAmount);
    const minRequired =
      (product.currentBid ?? product.price) + (product.minimumBid ?? 0);

    if (bidValue < minRequired) {
      Alert.alert("Error", `Minimum bid is ₱${minRequired.toLocaleString()}`);
      return;
    }

    Alert.alert("Place Bid", `Place a bid of ₱${bidValue.toLocaleString()}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm Bid",
        onPress: () => {
          Alert.alert("Success", "Bid placed successfully!");
          setBidAmount("");
        },
      },
    ]);
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentImageIndex(index);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing product:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const renderActionButtons = () => {
    // Don't show action buttons if the user is the seller
    if (user && product?.seller.id === user.id) {
      return (
        <View className="px-6 py-4 bg-white border-t border-neutral-100">
          <View className="p-4 bg-neutral-50 rounded-xl">
            <Text className="text-center text-sm font-inter-medium text-neutral-600">
              This is your product listing
            </Text>
          </View>
        </View>
      );
    }

    switch (product?.type) {
      case "direct_buy":
        return (
          <View className="px-6 py-4 bg-white border-t border-neutral-100">
            <TouchableOpacity
              onPress={handleBuyNow}
              className="w-full py-4 rounded-xl bg-primary-500 mb-3 active:bg-primary-600"
            >
              <Text className="text-center text-white text-base font-inter-semiBold">
                Buy Now - ₱{product?.price.toLocaleString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleContactSeller}
              className="w-full py-4 rounded-xl border-2 border-primary-500 bg-white active:bg-neutral-50"
            >
              <Text className="text-center text-primary-500 text-base font-inter-semiBold">
                Contact Seller
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "negotiable":
        return (
          <View className="px-6 py-4 bg-white border-t border-neutral-100">
            <View className="mb-3">
              <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
                Make an Offer
              </Text>
              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <TextInput
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-inter-regular text-neutral-900 text-base"
                    placeholder="Enter offer amount"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={offerAmount}
                    onChangeText={setOfferAmount}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleMakeOffer}
                  className="px-6 py-3 rounded-xl bg-warning-500 active:bg-warning-600 justify-center"
                >
                  <Text className="text-white text-base font-inter-semiBold">
                    Send
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-xs font-inter-regular text-neutral-500 mt-2">
                Asking price: ₱{product?.price.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleContactSeller}
              className="w-full py-4 rounded-xl border-2 border-primary-500 bg-white active:bg-neutral-50"
            >
              <Text className="text-center text-primary-500 text-base font-inter-semiBold">
                Contact Seller
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "bidding":
        return (
          <View className="px-6 py-4 bg-white border-t border-neutral-100">
            {/* Bidding Info */}
            <View className="mb-4 p-4 bg-success-50 rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-inter-regular text-neutral-600">
                  Current Bid
                </Text>
                <Text className="text-sm font-inter-medium text-success-600">
                  {product?.endTime}
                </Text>
              </View>
              <Text className="text-2xl font-inter-bold text-success-600 mb-1">
                ₱{product?.currentBid?.toLocaleString()}
              </Text>
              <Text className="text-xs font-inter-regular text-neutral-500">
                {product?.bidCount} bids • Starting price: ₱ ₱
                {product?.price.toLocaleString()}
              </Text>
            </View>

            {/* Place Bid */}
            <View className="mb-3">
              <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
                Place Your Bid
              </Text>
              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <TextInput
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-inter-regular text-neutral-900 text-base"
                    placeholder={`Min: ₱${(
                      (product?.currentBid || product?.price) +
                      (product?.minimumBid || 0)
                    ).toLocaleString()}`}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={bidAmount}
                    onChangeText={setBidAmount}
                  />
                </View>
                <TouchableOpacity
                  onPress={handlePlaceBid}
                  className="px-6 py-3 rounded-xl bg-success-500 active:bg-success-600 justify-center"
                >
                  <Text className="text-white text-base font-inter-semiBold">
                    Bid
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-xs font-inter-regular text-neutral-500 mt-2">
                Minimum increment: ₱{product?.minimumBid?.toLocaleString()}
              </Text>
            </View>
          </View>
        );
    }
  };

  const getProductTypeBadge = () => {
    switch (product?.type) {
      case "direct_buy":
        return (
          <View className="bg-primary-500 px-3 py-1.5 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-white">
              Buy Now
            </Text>
          </View>
        );
      case "negotiable":
        return (
          <View className="bg-warning-500 px-3 py-1.5 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-white">
              Negotiable
            </Text>
          </View>
        );
      case "bidding":
        return (
          <View className="bg-success-500 px-3 py-1.5 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-white">
              Bidding
            </Text>
          </View>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-neutral-100">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </TouchableOpacity>
        </View>
        <ProductDetailsLoadingState />
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-neutral-100">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-inter-bold text-neutral-900 mb-2">
            Product Not Found
          </Text>
          <Text className="text-base font-inter-regular text-neutral-600 text-center mb-6">
            The product you're looking for doesn't exist or has been removed.
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-neutral-100">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </TouchableOpacity>
          <View className="flex-row">
            <TouchableOpacity
              onPress={handleShare}
              className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center mr-2"
              activeOpacity={0.7}
            >
              <ShareIosRegularIcon size={24} />
            </TouchableOpacity>
            {/* Only show favorite button if user is not the seller */}
            {!(user && product?.seller.id === user.id) && (
              <TouchableOpacity
                onPress={handleFavorite}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isFavorite ? "bg-error-100" : "bg-neutral-100"
                }`}
                activeOpacity={0.7}
              >
                {isFavorite ? (
                  <HeartFilledIcon size={24} color="#EF4444" />
                ) : (
                  <HeartRegularIcon size={24} color="#374151" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0D3F81"]}
              tintColor="#0D3F81"
            />
          }
        >
          {/* Image Gallery */}
          <View className="relative">
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {product.images.map((image, index) => (
                <View key={index} style={{ width }}>
                  <Image
                    source={{ uri: image }}
                    style={{ width, height: 400 }}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Image Indicators */}
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
              {product.images.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </View>
          </View>

          {/* Product Info */}
          <View className="px-6 py-4">
            {/* Category & Type Badge */}
            <View className="flex-row items-center mb-3">
              <View className="bg-neutral-100 px-3 py-1 rounded-lg mr-2">
                <Text className="text-xs font-inter-medium text-neutral-700">
                  {product.category}
                </Text>
              </View>
              {getProductTypeBadge()}
            </View>

            {/* Title */}
            <Text className="text-2xl font-inter-bold text-neutral-900 mb-3">
              {product.title}
            </Text>

            {/* Price (for non-bidding items) */}
            {product.type !== "bidding" && (
              <Text className="text-3xl font-inter-bold text-primary-500 mb-3">
                ₱{product.price.toLocaleString()}
              </Text>
            )}

            {/* Location & Condition */}
            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center">
                <LocationRegularIcon size={16} color="#6B7280" />
                <Text className="text-sm font-inter-regular text-neutral-600 mr-4">
                  {product.location}
                </Text>
              </View>
              <View className="bg-success-100 px-2 py-1 rounded-lg">
                <Text className="text-xs font-inter-semiBold text-success-700">
                  {product.condition}
                </Text>
              </View>
            </View>

            {/* Seller Info */}
            <TouchableOpacity
              onPress={handleContactSeller}
              className="flex-row items-center p-4 bg-neutral-50 rounded-2xl mb-4"
              activeOpacity={0.7}
            >
              {product.seller.avatar ? (
                <Image
                  source={{ uri: product.seller.avatar }}
                  className="w-14 h-14 rounded-full mr-3"
                />
              ) : (
                <View className="w-14 h-14 rounded-full mr-3 bg-primary-100 items-center justify-center">
                  <Text className="text-2xl font-inter-medium text-primary-500">
                    {product.seller.name.charAt(0)}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-inter-semiBold text-neutral-900 mr-2">
                    {product.seller.name}
                  </Text>
                  {product.seller.verified && (
                    <View className="bg-success-100 px-2 py-0.5 rounded-full">
                      <Text className="text-xs font-inter-semiBold text-success-700">
                        ✓ Verified
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center">
                  <View className="flex-row items-center mr-3">
                    {product.seller.rating > 0 ? (
                      <>
                        <Text className="text-xs font-inter-regular text-neutral-600 mr-1">
                          {product.seller.rating.toFixed(1)}
                        </Text>
                        <StarColorIcon size={12} />
                      </>
                    ) : (
                      <Text className="text-xs font-inter-regular text-neutral-500">
                        No ratings yet
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-lg font-inter-bold text-neutral-900 mb-2">
                Description
              </Text>
              <Text className="text-base font-inter-regular text-neutral-600 leading-6">
                {product.description}
              </Text>
            </View>

            {/* Specifications */}
            {product.specs && (
              <View className="mb-4">
                <Text className="text-lg font-inter-bold text-neutral-900 mb-3">
                  Specifications
                </Text>
                <View className="bg-neutral-50 rounded-2xl overflow-hidden">
                  {Object.entries(product.specs).map(([key, value], index) => (
                    <View
                      key={key}
                      className={`flex-row items-center justify-between px-4 py-3 ${
                        index !== Object.keys(product.specs!).length - 1
                          ? "border-b border-neutral-200"
                          : ""
                      }`}
                    >
                      <Text className="text-sm font-inter-medium text-neutral-700">
                        {key}
                      </Text>
                      <Text className="text-sm font-inter-regular text-neutral-600">
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        {renderActionButtons()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
