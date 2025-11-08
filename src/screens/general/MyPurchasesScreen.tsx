import React from "react";
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
import { useQuery } from "@tanstack/react-query";
import { transactionsAPI } from "../../constants/axios";
import { ShoppingBagRegularIcon } from "../../components/icons/outline/shop-bag-outline";
import { MoreVerticalRegularIcon } from "../../components/icons/outline/more-vertical-outline";
import { TransactionCompletionModal } from "../../components/modals/TransactionCompletionModal";

interface CompletionData {
  buyerName: string;
  sellerName: string;
  productName: string;
  meetupLocation: string;
  completedAt: string;
  referenceNumber: string;
  blockchainTxHash: string;
  totalPrice: string;
}

interface Transaction {
  id: string;
  status: string;
  agreedPrice: string;
  createdAt: string;
  scheduledMeetupAt?: string;
  meetupLocation?: string;
  meetupStatus?: string;
}

interface Product {
  id: string;
  title: string;
  coverImage: string;
  price: number;
  location: string;
}

interface Seller {
  id: string;
  displayName: string;
  avatarUrl: string;
  verified: boolean;
}

interface Purchase {
  transaction: Transaction;
  product: Product;
  seller: Seller;
  completionData: CompletionData;
}

const TransactionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          bg: "bg-primary-50",
          text: "text-primary-700",
          label: "Active",
        };
      case "completed":
        return {
          bg: "bg-success-50",
          text: "text-success-700",
          label: "Completed",
        };
      case "cancelled_by_buyer":
        return {
          bg: "bg-error-50",
          text: "text-error-700",
          label: "Cancelled",
        };
      case "cancelled_by_seller":
        return {
          bg: "bg-error-50",
          text: "text-error-700",
          label: "Cancelled",
        };
      case "expired":
        return {
          bg: "bg-neutral-100",
          text: "text-neutral-600",
          label: "Expired",
        };
      default:
        return {
          bg: "bg-neutral-100",
          text: "text-neutral-600",
          label: status,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View className={`${config.bg} px-3 py-1.5 rounded-lg`}>
      <Text className={`text-xs font-inter-semiBold ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
};

const PurchaseCard: React.FC<{
  purchase: Purchase;
  onPress: () => void;
  onMorePress: () => void;
}> = ({ purchase, onPress, onMorePress }) => {
  const { transaction, product, seller } = purchase;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 border border-neutral-100"
      activeOpacity={0.7}
    >
      {/* Product Image and Status */}
      <View className="flex-row p-3">
        <View className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-200 mr-3">
          <Image
            source={{ uri: product.coverImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="flex-1">
          {/* Transaction Status */}
          <View className="flex-row items-center justify-between mb-2">
            <TransactionStatusBadge status={transaction.status} />
            <View className="flex-row items-center">
              <Text className="text-xs font-inter-regular text-neutral-500">
                {formatDate(transaction.createdAt)}
              </Text>
              {transaction.status === "completed" && (
                <TouchableOpacity
                  onPress={onMorePress}
                  className="w-8 h-8 items-center justify-center -mr-2"
                >
                  <MoreVerticalRegularIcon size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Product Title */}
          <Text
            className="text-sm font-inter-semiBold text-neutral-900 mb-1"
            numberOfLines={2}
          >
            {product.title}
          </Text>

          {/* Price */}
          <Text className="text-base font-inter-bold text-primary-500">
            ₱{parseFloat(transaction.agreedPrice).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Seller Info */}
      <View className="px-3 pb-3 pt-2 border-t border-neutral-100">
        <View className="flex-row items-center">
          {seller.avatarUrl ? (
            <Image
              source={{ uri: seller.avatarUrl }}
              className="w-8 h-8 rounded-full mr-2"
            />
          ) : (
            <View className="w-8 h-8 rounded-full mr-2 bg-primary-100 items-center justify-center">
              <Text className="text-xs font-inter-medium text-primary-500">
                {seller.displayName.charAt(0)}
              </Text>
            </View>
          )}
          <View className="flex-1 flex-row items-center">
            <Text
              className="text-xs font-inter-semiBold text-neutral-800 mr-1"
              numberOfLines={1}
            >
              {seller.displayName}
            </Text>
            {seller.verified && (
              <View className="bg-primary-50 px-1.5 py-0.5 rounded-full">
                <Text className="text-[10px] font-inter-semiBold text-primary-500">
                  ✓
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Meetup Info */}
        {transaction.meetupStatus === "confirmed" &&
          transaction.meetupLocation && (
            <View className="flex-row items-center mt-2 gap-1">
              <LocationRegularIcon color="#6B7280" size={14} />
              <Text
                className="text-xs font-inter-regular text-neutral-500 flex-1"
                numberOfLines={1}
              >
                {transaction.meetupLocation}
              </Text>
            </View>
          )}
      </View>
    </TouchableOpacity>
  );
};

export default function MyPurchasesScreen({ navigation }: { navigation: any }) {
  const [refreshing, setRefreshing] = React.useState(false);
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [selectedCompletionData, setSelectedCompletionData] =
    React.useState<CompletionData | null>(null);

  const {
    data: purchasesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["myPurchases"],
    queryFn: async () => {
      const response = await transactionsAPI.getMyPurchases();
      return response.data.purchases;
    },
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePurchasePress = (purchase: Purchase) => {
    // Navigate to product detail
    navigation.navigate("general", {
      screen: "productDetail",
      params: { productId: purchase.product.id },
    } as never);
  };

  const handleMorePress = (completionData: CompletionData) => {
    setSelectedCompletionData(completionData);
    setModalVisible(true);
  };

  const purchases: Purchase[] = purchasesData || [];

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
              My Purchases
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-600 mt-0.5">
              {purchases.length} {purchases.length === 1 ? "item" : "items"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pt-4 pb-8"
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
              Loading purchases...
            </Text>
          </View>
        ) : error ? (
          <View className="py-20 items-center px-6">
            <Text className="text-5xl mb-4">⚠️</Text>
            <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2">
              Failed to load purchases
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
        ) : purchases.length === 0 ? (
          <View className="py-20 items-center px-6">
            <ShoppingBagRegularIcon size={110} color="#6B7280" />
            <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2 mt-4">
              No purchases yet
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-500 text-center">
              Your purchase history will appear here
            </Text>
          </View>
        ) : (
          <>
            {purchases.map((purchase) => (
              <PurchaseCard
                key={purchase.transaction.id}
                purchase={purchase}
                onPress={() => handlePurchasePress(purchase)}
                onMorePress={() => handleMorePress(purchase.completionData)}
              />
            ))}
          </>
        )}
      </ScrollView>
      <TransactionCompletionModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        completionData={selectedCompletionData}
      />
    </View>
  );
}
