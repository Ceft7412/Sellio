import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { transactionsAPI } from "../../constants/axios";
import { CheckmarkCircleRegularIcon } from "../icons/outline/check-mark-outline";
import { MoreVerticalRegularIcon } from "../icons/outline/more-vertical-outline";
import { TransactionCompletionModal } from "../modals/TransactionCompletionModal";

interface Transaction {
  id: string;
  status: string;
  agreedPrice: string;
  completedAt: string;
  product: {
    id: string;
    title: string;
    coverImage: string;
  };
  buyer: {
    id: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
  };
}

export default function SalesTab({ navigation }: { navigation: any }) {
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const {
    data: salesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mySales"],
    queryFn: async () => {
      const response = await transactionsAPI.getMySales();
      // Filter only completed transactions
      return response.data.sales.filter(
        (s: any) => s.transaction.status === "completed"
      );
    },
  });

  const handleSalePress = (productId: string) => {
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
          Loading sales...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-20 items-center px-6">
        <Text className="text-5xl mb-4">⚠️</Text>
        <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2">
          Failed to load sales
        </Text>
      </View>
    );
  }

  const sales = salesData || [];

  if (sales.length === 0) {
    return (
      <View className="py-20 items-center px-6">
        <CheckmarkCircleRegularIcon size={100} color="#6B7280" />
        <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2 mt-4">
          No completed sales yet
        </Text>
        <Text className="text-sm font-inter-regular text-neutral-500 text-center">
          Your completed transactions will appear here
        </Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View className="px-4 pt-4 pb-8">
      {/* Sales Summary */}
      <View className="bg-success-50 rounded-xl p-4 mb-4 border border-success-200">
        <Text className="text-sm font-inter-semiBold text-success-900">
          {sales.length} completed {sales.length === 1 ? "sale" : "sales"}
        </Text>
        <Text className="text-xl font-inter-bold text-success-700 mt-1">
          ₱
          {sales
            .reduce(
              (total: number, sale: any) =>
                total + parseFloat(sale.transaction.agreedPrice),
              0
            )
            .toLocaleString()}
        </Text>
        <Text className="text-xs font-inter-regular text-success-600 mt-1">
          Total earnings from completed sales
        </Text>
      </View>

      {/* Sales List */}
      {sales.map((sale: any) => (
        <View key={sale.transaction.id} className="bg-white rounded-2xl shadow-sm mb-4 border border-neutral-100">
          <TouchableOpacity
            onPress={() => handleSalePress(sale.product.id)}
            activeOpacity={0.7}
          >
            {/* Product and Sale Info */}
            <View className="flex-row p-3 border-b border-neutral-100">
              {/* Product Image */}
              <View className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-200 mr-3">
                {sale.product.coverImage ? (
                  <Image
                    source={{ uri: sale.product.coverImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <CheckmarkCircleRegularIcon size={24} color="#9CA3AF" />
                  </View>
                )}
              </View>

              {/* Sale Details */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="bg-success-50 px-2 py-1 rounded-lg">
                    <Text className="text-xs font-inter-semiBold text-success-700">
                      Completed
                    </Text>
                  </View>
                  <Text className="text-xs font-inter-regular text-neutral-500">
                    {formatDate(sale.transaction.completedAt)}
                  </Text>
                </View>

                <Text
                  className="text-sm font-inter-semiBold text-neutral-900 mb-1"
                  numberOfLines={2}
                >
                  {sale.product.title}
                </Text>

                <Text className="text-base font-inter-bold text-success-600">
                  ₱{parseFloat(sale.transaction.agreedPrice).toLocaleString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Buyer Info and Actions */}
          <View className="px-3 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
                {sale.buyer.avatarUrl ? (
                  <Image
                    source={{ uri: sale.buyer.avatarUrl }}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                ) : (
                  <View className="w-8 h-8 rounded-full mr-2 bg-primary-100 items-center justify-center">
                    <Text className="text-xs font-inter-medium text-primary-500">
                      {sale.buyer.displayName.charAt(0)}
                    </Text>
                  </View>
                )}
                <View className="flex-1 flex-row items-center">
                  <Text className="text-xs font-inter-medium text-neutral-600 mr-1">
                    Sold to:
                  </Text>
                  <Text
                    className="text-sm font-inter-semiBold text-neutral-800 mr-1"
                    numberOfLines={1}
                  >
                    {sale.buyer.displayName}
                  </Text>
                  {sale.buyer.verified && (
                    <View className="bg-primary-50 px-1.5 py-0.5 rounded-full">
                      <Text className="text-[10px] font-inter-semiBold text-primary-500">
                        ✓
                      </Text>
                    </View>
                  )}
                </View>
            </View>
            <TouchableOpacity onPress={() => { setSelectedSale(sale.completionData); setModalVisible(true); }} className="p-2">
                <MoreVerticalRegularIcon size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TransactionCompletionModal 
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        completionData={selectedSale}
      />
    </View>
  );
}
