import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeftRegularIcon } from "../../components/icons/outline/chevron-left";
import { LocationRegularIcon } from "../../components/icons/outline/location-outline";
import { useProducts } from "../../hooks/useProducts";
import { BoxRegularIcon } from "../../components/icons/outline/box-outline";

interface Product {
  id: string;
  title: string;
  price: number;
  coverImage: string;
  category: string;
  location: string;
  saleType: "fixed" | "negotiable" | "bidding";
  seller: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
}

const ProductCard: React.FC<{ product: Product; onPress: () => void }> = ({
  product,
  onPress,
}) => {
  const getProductTypeBadge = () => {
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

        {/* Location */}
        <View className="flex-row items-center mb-2 gap-1">
          <LocationRegularIcon color="#6B7280" size={16} />
          <Text className="text-xs font-inter-regular text-neutral-500">
            {product.location}
          </Text>
        </View>

        {/* Seller Info */}
        <View className="flex-row items-center pt-3 border-t border-neutral-100">
          {product.seller.avatar ? (
            <Image
              source={{ uri: product.seller.avatar }}
              className="w-8 h-8 rounded-full mr-2"
            />
          ) : (
            <View className="w-8 h-8 rounded-full mr-2 bg-primary-100 items-center justify-center">
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

export default function CategoryProductsScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { categoryId, categoryName, isSubCategory } = route.params || {};

  const [refreshing, setRefreshing] = useState(false);

  // Fetch products filtered by category or subcategory
  const queryParams = isSubCategory
    ? { sub_category: categoryId, limit: 50, offset: 0 }
    : { category: categoryId, limit: 50, offset: 0 };

  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useProducts(queryParams);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Map products data to UI format
  const products: Product[] =
    productsData?.map((prod) => ({
      id: prod.id,
      title: prod.title,
      price: prod.price,
      coverImage: prod.coverImage,
      saleType: prod.saleType as "fixed" | "negotiable" | "bidding",
      category: prod.category,
      location: prod.location,
      seller: prod.seller,
    })) || [];

  const handleProductPress = (product: Product) => {
    navigation.navigate("general", {
      screen: "productDetail",
      params: { productId: product.id },
    } as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Split products into two columns for masonry layout
  const leftColumnProducts = products.filter((_, index) => index % 2 === 0);
  const rightColumnProducts = products.filter((_, index) => index % 2 === 1);

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-neutral-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 mr-3"
          >
            <ChevronLeftRegularIcon size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-inter-bold text-neutral-900">
              {categoryName || "Category"}
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-600 mt-0.5">
              {products.length} {products.length === 1 ? "item" : "items"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-2 pt-4 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0D3F81"]}
            tintColor="#0D3F81"
          />
        }
      >
        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#0D3F81" />
            <Text className="text-base font-inter-medium text-neutral-600 mt-4">
              Loading products...
            </Text>
          </View>
        ) : error ? (
          <View className="py-20 items-center px-6">
            <Text className="text-5xl mb-4">⚠️</Text>
            <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2">
              Failed to load products
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-500 text-center mb-4">
              Please try again later
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="px-6 py-3 bg-primary-500 rounded-xl"
            >
              <Text className="text-white font-inter-semiBold">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : products.length === 0 ? (
          <View className="py-20 items-center px-6">
            <BoxRegularIcon size={110} color="#6B7280" />
            <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2">
              No products found
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-500 text-center">
              There are no products in this category yet
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
      </ScrollView>
    </View>
  );
}
