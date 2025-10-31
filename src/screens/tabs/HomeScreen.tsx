import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchRegularIcon } from "../../components/icons/outline/search-outline";
import { ChatRegularIcon } from "../../components/icons/outline/chat-outline";
import { HeartRegularIcon } from "../../components/icons/outline/heart-outline";
import { LocationRegularIcon } from "../../components/icons/outline/location-outline";
import { useAuthStore } from "../../store/authStore";
import { useProducts, useUserFavorites } from "../../hooks/useProducts";
import { useParentCategories } from "../../hooks/useCategories";
import {
  CategoryHorizontalLoadingState,
  ProductsGridLoadingState,
} from "../../components/states/loading";
import { useUnreadMessagesCount } from "../../hooks/useMessages";

// Types
type ProductType = "fixed" | "negotiable" | "bidding";

interface Category {
  id: string;
  name: string;
  image: string;
}

interface Seller {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

interface Product {
  id: string;
  title: string;
  price: number;
  coverImage: string;
  category: string;
  location: string;
  saleType: ProductType;
  seller: Seller;
  currentBid?: number;
  endTime?: string;
}

// Components
const CategoryCard: React.FC<{ category: Category; onPress: () => void }> = ({
  category,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-3 w-24"
      activeOpacity={0.7}
    >
      <View className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-200 mb-2">
        <Image
          source={{ uri: category.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <Text className="text-xs font-inter-medium text-neutral-800 text-center">
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const ProductCard: React.FC<{ product: Product; onPress: () => void }> = ({
  product,
  onPress,
}) => {
  console.log("Product", product);
  const getProductTypeBadge = () => {
    console.log("Product Sale Type", product.saleType);
    switch (product.saleType) {
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
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4"
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View className="w-full h-48 bg-neutral-200 relative">
        <Image
          source={{ uri: product.coverImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Product Type Badge */}

        {/* Category Badge */}
        <View className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded-lg max-w-24">
          <Text
            className="text-xs font-inter-medium text-white truncate"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {product.category}
          </Text>
        </View>
        <View className="absolute top-2 right-2">{getProductTypeBadge()}</View>
      </View>

      {/* Product Info */}
      <View className="p-3">
        {/* Title */}
        <Text
          className="text-sm font-inter-semiBold text-neutral-900 mb-2"
          numberOfLines={2}
        >
          {product.title}
        </Text>

        <Text className="text-lg font-inter-bold text-primary-500 mb-2">
          ₱{product.price.toLocaleString()}
        </Text>
        {/* L ocation */}
        <View className="flex-row items-center mb-2 gap-1">
          <LocationRegularIcon color="#6B7280" size={16} />
          <Text className="text-xs font-inter-regular text-neutral-500">
            {product.location}
          </Text>
        </View>

        {/* Seller Info */}
        <View className="flex-row items-center pt-3 border-t border-neutral-100">
          {/* If no avatar, show a default avatar */}
          {product.seller.avatar ? (
            <Image
              source={{ uri: product.seller.avatar }}
              className="w-8 h-8 rounded-full mr-2"
            />
          ) : (
            <View className="w-8 h-8 rounded-full mr-2 bg-primary-100  items-center justify-center">
              <Text className="text-xs font-inter-medium text-primary-500">
                {product.seller.name.charAt(0)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text
                className="text-xs font-inter-medium text-neutral-800 mr-1"
                numberOfLines={1}
              >
                {product.seller.name}
              </Text>
              {product.seller.verified && (
                <View className="bg-primary-50 px-1.5 py-0.5 rounded-full">
                  <Text className="text-[10px] font-inter-semiBold text-primary-500">
                    ✓
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();

  // Use TanStack Query hooks
  const {
    data: categoriesData,
    isLoading: loadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useParentCategories();

  const {
    data: productsData,
    isLoading: loadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts({ limit: 20, offset: 0 });

  // Fetch user's favorites count (only if logged in)
  const { data: favorites } = useUserFavorites();
  const favoritesCount = favorites?.length || 0;

  // Fetch unread messages count with real-time updates (only if logged in)
  const unreadMessagesCount = user ? useUnreadMessagesCount() : 0;

  // Refresh handler
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCategories(), refetchProducts()]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchCategories, refetchProducts]);

  // Map categories data to UI format
  const categories: Category[] =
    categoriesData?.map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image_url || "https://via.placeholder.com/150",
    })) || [];

  // Map products data to UI format with ProductType
  const products: Product[] =
    productsData?.map((prod) => ({
      id: prod.id,
      title: prod.title,
      price: prod.price,
      coverImage: prod.coverImage,
      saleType: prod.saleType as ProductType,
      category: prod.category,
      location: prod.location,
      seller: prod.seller,
    })) || [];

  const handleSearch = () => {
    console.log("Search pressed");
    // TODO: Navigate to search screen
  };

  const handleChat = () => {
    if (!user) {
      navigation.navigate("auth", { screen: "login" });
      return;
    }
    navigation.navigate("general", { screen: "conversations" });
  };

  const handleFavorites = () => {
    if (!user) {
      navigation.navigate("auth", { screen: "login" });
      return;
    }
    navigation.navigate("general", { screen: "favorites" });
  };

  const handleCategoryPress = (category: Category) => {
    console.log("Category pressed:", category.name);
    // TODO: Navigate to category screen
  };

  const handleProductPress = (product: Product) => {
    // Navigate to product detail screen with only product ID
    navigation.navigate("general", {
      screen: "productDetail",
      params: { productId: product.id },
    } as never);
  };

  // Split products into two columns for masonry layout
  const leftColumnProducts = products.filter((_, index) => index % 2 === 0);
  const rightColumnProducts = products.filter((_, index) => index % 2 === 1);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["left"]}>
      {/* Header */}
      <View className="bg-white px-6 py-2 border-b border-neutral-100 pt-12">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-inter-bold text-primary-500">
            Sellio
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleSearch}
              className="w-12 h-12 rounded-full bg-neutral-100 items-center justify-center mr-2"
              activeOpacity={0.7}
            >
              <SearchRegularIcon size={26} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleChat}
              className="w-12 h-12 rounded-full bg-neutral-100 items-center justify-center mr-2 relative"
              activeOpacity={0.7}
            >
              <ChatRegularIcon size={26} color="#374151" />
              {/* Unread messages count badge */}
              {user && unreadMessagesCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-error-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                  <Text className="text-white text-xs font-inter-bold">
                    {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleFavorites}
              className="w-12 h-12 rounded-full bg-neutral-100 items-center justify-center relative"
              activeOpacity={0.7}
            >
              <HeartRegularIcon size={26} color="#374151" />
              {/* Favorites count badge */}
              {user && favoritesCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-error-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                  <Text className="text-white text-xs font-inter-bold">
                    {favoritesCount > 99 ? "99+" : favoritesCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0D3F81"]}
            tintColor="#0D3F81"
          />
        }
      >
        {/* Categories Section */}
        <View className="py-4">
          <View className="px-2 mb-3">
            <Text className="text-lg font-inter-bold text-neutral-900">
              Categories
            </Text>
          </View>
          {loadingCategories ? (
            <CategoryHorizontalLoadingState count={8} />
          ) : (
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CategoryCard
                  category={item}
                  onPress={() => handleCategoryPress(item)}
                />
              )}
            />
          )}
        </View>

        {/* Products Section */}
        <View className="px-2 pt-4">
          <View className="mb-4">
            <Text className="text-lg font-inter-bold text-neutral-900">
              Explore Products
            </Text>
          </View>

          {loadingProducts ? (
            <ProductsGridLoadingState count={6} />
          ) : products.length === 0 ? (
            <View className="py-12 items-center">
              <Text className="text-base font-inter-medium text-neutral-500">
                No products available
              </Text>
              <Text className="text-sm font-inter-regular text-neutral-400 mt-2">
                Be the first to list a product!
              </Text>
            </View>
          ) : (
            <View className="flex-row">
              {/* Left Column */}
              <View className="flex-1 mr-1">
                {leftColumnProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => handleProductPress(product)}
                  />
                ))}
              </View>

              {/* Right Column */}
              <View className="flex-1 ml-1">
                {rightColumnProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => handleProductPress(product)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
