import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import React from "react";
import { buysAPI } from "../../../../constants/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface BuyDetails {
  id: string;
  amount: string;
  status: "pending" | "confirmed_pending_meetup" | "cancelled_by_buyer" | "cancelled_by_seller" | "expired" | "completed";
  buyerId: string;
  sellerId: string;
}

interface BuyActionsProps {
  buy: BuyDetails;
  currentUserId: string;
  conversationId: string;
}

export const BuyActions: React.FC<BuyActionsProps> = ({
  buy,
  currentUserId,
  conversationId,
}) => {
  const queryClient = useQueryClient();

  const isSeller = currentUserId === buy.sellerId;
  const isBuyer = currentUserId === buy.buyerId;

  // Confirm buy mutation
  const confirmMutation = useMutation({
    mutationFn: () => buysAPI.confirmBuy(buy.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to confirm purchase");
    },
  });

  const handleConfirm = () => {
    Alert.alert(
      "Confirm Purchase",
      `Confirm the purchase of ₱${parseFloat(buy.amount).toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => confirmMutation.mutate() },
      ]
    );
  };

  // Don't show actions if buy is already confirmed, expired, or completed
  if (buy.status === "confirmed_pending_meetup" || buy.status === "expired" || buy.status === "completed") {
    return null;
  }

  // Seller view - Show Confirm button only
  if (isSeller && buy.status === "pending") {
    return (
      <View className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
        <Text className="text-sm font-inter-medium text-neutral-700 mb-3">
          Confirm purchase request
        </Text>
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={confirmMutation.isPending}
          className="py-3 px-4 rounded-xl bg-primary-500 items-center"
        >
          {confirmMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-base font-inter-semibold text-white">
              Confirm Purchase
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Buyer view - Show waiting message
  if (isBuyer && buy.status === "pending") {
    return (
      <View className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
        <Text className="text-sm font-inter-medium text-neutral-700 text-center">
          Waiting for seller to confirm purchase...
        </Text>
      </View>
    );
  }

  return null;
};
