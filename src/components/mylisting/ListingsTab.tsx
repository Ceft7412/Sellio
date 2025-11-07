import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "../../constants/axios";
import { BoxRegularIcon } from "../icons/outline/box-outline";

interface Product {
  id: string;
  title: string;
  price: string;
  status: string;
  coverImage: string;
  saleType: string;
  createdAt: string;
}

export default function ListingsTab({ navigation }: { navigation: any }) {
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myProducts"],
    queryFn: async () => {
      const response = await productsAPI.getUserProducts();
      return response.data.products;
    },
  });

  const handleProductPress = (productId: string) => {
    navigation.navigate("general", {
      screen: "productDetail",
      params: { productId },
    } as never);
  };

  if (isLoading) {
    return (
      <View className="py-20 items-center">
        <ActivityIndicator size="large" color="#0D3F81" />
        <Text className="text-base font-inter-medium text-neutral-600 mt-4">
          Loading listings...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-20 items-center px-6">
        <Text className="text-5xl mb-4">⚠️</Text>
        <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2">
          Failed to load listings
        </Text>
      </View>
    );
  }

  const products: Product[] = productsData || [];

  if (products.length === 0) {
    return (
      <View className="py-20 items-center px-6">
        <BoxRegularIcon size={100} color="#6B7280" />
        <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2 mt-4">
          No listings yet
        </Text>
        <Text className="text-sm font-inter-regular text-neutral-500 text-center">
          Start selling by creating your first product listing
        </Text>
      </View>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <View className="bg-success-50 px-2 py-1 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-success-700">
              Active
            </Text>
          </View>
        );
      case "sold":
        return (
          <View className="bg-neutral-100 px-2 py-1 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-neutral-600">
              Sold
            </Text>
          </View>
        );
      case "draft":
        return (
          <View className="bg-warning-50 px-2 py-1 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-warning-700">
              Draft
            </Text>
          </View>
        );
      case "expired":
        return (
          <View className="bg-error-50 px-2 py-1 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-error-700">
              Expired
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const getSaleTypeBadge = (saleType: string) => {
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

  return (
    <View className="px-4 pt-4 pb-8">
      {products.map((product) => (
        <TouchableOpacity
          key={product.id}
          onPress={() => handleProductPress(product.id)}
          className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 border border-neutral-100"
          activeOpacity={0.7}
        >
          <View className="flex-row p-3">
            {/* Product Image */}
            <View className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-200 mr-3">
              {product.coverImage ? (
                <Image
                  source={{ uri: product.coverImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <BoxRegularIcon size={32} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Product Info */}
            <View className="flex-1">
              {/* Status and Sale Type */}
              <View className="flex-row items-center gap-2 mb-2">
                {getStatusBadge(product.status)}
                {getSaleTypeBadge(product.saleType)}
              </View>

              {/* Title */}
              <Text
                className="text-sm font-inter-semiBold text-neutral-900 mb-1"
                numberOfLines={2}
              >
                {product.title}
              </Text>

              {/* Price */}
              <Text className="text-base font-inter-bold text-primary-500 mb-1">
                ₱{parseFloat(product.price).toLocaleString()}
              </Text>

              {/* Created Date */}
              <Text className="text-xs font-inter-regular text-neutral-500">
                Listed {new Date(product.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
