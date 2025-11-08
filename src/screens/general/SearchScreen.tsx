import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeftRegularIcon } from "../../components/icons/outline/chevron-left";
import { SearchRegularIcon } from "../../components/icons/outline/search-outline";
import { LocationRegularIcon } from "../../components/icons/outline/location-outline";
import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "../../constants/axios";

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
    displayName: string;
    avatarUrl: string;
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
          {product.seller.avatarUrl ? (
            <Image
              source={{ uri: product.seller.avatarUrl }}
              className="w-8 h-8 rounded-full mr-2"
            />
          ) : (
            <View className="w-8 h-8 rounded-full mr-2 bg-primary-100 items-center justify-center">
              <Text className="text-xs font-inter-medium text-primary-500">
                {product.seller.displayName.charAt(0)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text
                className="text-xs font-inter-medium text-neutral-800 mr-1"
                numberOfLines={1}
              >
                {product.seller.displayName}
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

export default function SearchScreen({ navigation }: { navigation: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      setDebouncedQuery(text);
    }, 500);
  };

  // Fetch all products when searching
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["searchProducts", debouncedQuery],
    queryFn: async () => {
      const response = await productsAPI.getAll({ limit: 100, offset: 0 });
      return response.data.products;
    },
    enabled: true, // Always fetch to allow filtering
  });

  // Filter products based on search query
  const filteredProducts: Product[] = React.useMemo(() => {
    if (!productsData) return [];

    const mapped: Product[] = productsData.map((prod: any) => ({
      id: prod.id,
      title: prod.title,
      price: parseFloat(prod.price),
      coverImage: prod.coverImage,
      saleType: prod.saleType as "fixed" | "negotiable" | "bidding",
      category: prod.category?.name || "Uncategorized",
      location: prod.location || "Unknown",
      seller: {
        id: prod.seller?.id || "",
        displayName: prod.seller?.displayName || "Unknown",
        avatarUrl: prod.seller?.avatarUrl || "",
        verified: !!prod.seller?.verified,
      },
    }));

    if (!debouncedQuery.trim()) {
      return mapped;
    }

    const query = debouncedQuery.toLowerCase();
    return mapped.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.location.toLowerCase().includes(query)
    );
  }, [productsData, debouncedQuery]);

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
  const leftColumnProducts = filteredProducts.filter(
    (_, index) => index % 2 === 0
  );
  const rightColumnProducts = filteredProducts.filter(
    (_, index) => index % 2 === 1
  );

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-neutral-100">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 mr-3"
          >
            <ChevronLeftRegularIcon size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-inter-bold text-primary-500">
            Search Products
          </Text>
        </View>

        {/* Search Bar */}
        <View className="relative">
          <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <SearchRegularIcon size={20} color="#6B7280" />
          </View>
          <TextInput
            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-inter-regular text-neutral-900 text-base"
            placeholder="Search by title, category, or location..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus
          />
        </View>

        {/* Results count */}
        {debouncedQuery.trim() && (
          <Text className="text-sm font-inter-regular text-neutral-600 mt-2">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "result" : "results"} found
          </Text>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-2 pt-4 pb-8"
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
            <Text className="text-sm font-inter-regular text-neutral-500 text-center">
              Please try again later
            </Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View className="py-20 items-center px-6">
            <SearchRegularIcon size={100} color="#6B7280" />
            <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2 mt-4">
              {debouncedQuery.trim() ? "No products found" : "Start searching"}
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-500 text-center">
              {debouncedQuery.trim()
                ? "Try different keywords"
                : "Enter keywords to search for products"}
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
