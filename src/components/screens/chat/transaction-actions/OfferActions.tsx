import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { offersAPI } from "../../../../constants/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface OfferDetails {
  id: string;
  amount: string;
  status: "pending" | "accepted" | "rejected" | "expired" | "withdrawn";
  buyerId: string;
  sellerId: string;
}

interface OfferActionsProps {
  offer: OfferDetails;
  currentUserId: string;
  conversationId: string;
}

export const OfferActions: React.FC<OfferActionsProps> = ({
  offer,
  currentUserId,
  conversationId,
}) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newAmount, setNewAmount] = useState(offer.amount);

  const isSeller = currentUserId === offer.sellerId;
  const isBuyer = currentUserId === offer.buyerId;

  // Accept offer mutation
  const acceptMutation = useMutation({
    mutationFn: () => offersAPI.acceptOffer(offer.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to accept offer");
    },
  });

  // Reject offer mutation
  const rejectMutation = useMutation({
    mutationFn: () => offersAPI.rejectOffer(offer.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to reject offer");
    },
  });

  // Update offer mutation
  const updateMutation = useMutation({
    mutationFn: (newAmount: string) => offersAPI.updateOffer(offer.id, newAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      setIsUpdating(false);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to update offer");
    },
  });

  const handleAccept = () => {
    Alert.alert(
      "Accept Offer",
      `Accept the offer of ₱${parseFloat(offer.amount).toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Accept", onPress: () => acceptMutation.mutate() },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      "Decline Offer",
      `Decline the offer of ₱${parseFloat(offer.amount).toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Decline", style: "destructive", onPress: () => rejectMutation.mutate() },
      ]
    );
  };

  const handleUpdateOffer = () => {
    if (!newAmount || parseFloat(newAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    updateMutation.mutate(newAmount);
  };

  // Don't show actions if offer is already accepted or expired
  if (offer.status === "accepted" || offer.status === "expired" || offer.status === "withdrawn") {
    return null;
  }

  // Seller view - Show Accept and Decline buttons
  if (isSeller && offer.status === "pending") {
    return (
      <View className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
        <Text className="text-sm font-inter-medium text-neutral-700 mb-3">
          Respond to offer
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleReject}
            disabled={rejectMutation.isPending || acceptMutation.isPending}
            className="flex-1 py-3 px-4 rounded-xl bg-white border border-neutral-300 items-center"
          >
            {rejectMutation.isPending ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text className="text-base font-inter-semibold text-neutral-700">
                Decline
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAccept}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            className="flex-1 py-3 px-4 rounded-xl bg-primary-500 items-center"
          >
            {acceptMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-inter-semibold text-white">
                Accept
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Buyer view - Show Update Offer button
  if (isBuyer && (offer.status === "pending" || offer.status === "rejected")) {
    return (
      <View className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
        {!isUpdating ? (
          <>
            <Text className="text-sm font-inter-medium text-neutral-700 mb-3">
              {offer.status === "rejected" ? "Your offer was declined" : "Update your offer"}
            </Text>
            <TouchableOpacity
              onPress={() => setIsUpdating(true)}
              className="py-3 px-4 rounded-xl bg-primary-500 items-center"
            >
              <Text className="text-base font-inter-semibold text-white">
                Update Offer
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
              Enter new offer amount
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  value={newAmount}
                  onChangeText={setNewAmount}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  className="px-4 py-3 rounded-xl bg-white border border-neutral-300 font-inter-regular text-base"
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsUpdating(false);
                  setNewAmount(offer.amount);
                }}
                disabled={updateMutation.isPending}
                className="py-3 px-4 rounded-xl bg-white border border-neutral-300 items-center justify-center"
              >
                <Text className="text-base font-inter-semibold text-neutral-700">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateOffer}
                disabled={updateMutation.isPending}
                className="py-3 px-4 rounded-xl bg-primary-500 items-center justify-center"
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-base font-inter-semibold text-white">
                    Update
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  }

  return null;
};
