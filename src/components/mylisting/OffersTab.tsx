import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { offersAPI } from "../../constants/axios";
import { TagRegularIcon } from "../icons/outline/tag-outline";

interface Offer {
  id: string;
  offerAmount: string;
  status: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    coverImage: string;
    price: string;
  };
  buyer: {
    id: string;
    displayName: string;
    avatarUrl: string;
  };
}

export default function OffersTab({ navigation }: { navigation: any }) {
  const queryClient = useQueryClient();

  const {
    data: offersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myOffers"],
    queryFn: async () => {
      const response = await offersAPI.getUserOffers();
      return response.data.offers;
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: (offerId: string) => offersAPI.acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOffers"] });
      Alert.alert("Success", "Offer accepted successfully!");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Failed to accept offer"
      );
    },
  });

  const rejectOfferMutation = useMutation({
    mutationFn: (offerId: string) => offersAPI.rejectOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOffers"] });
      Alert.alert("Success", "Offer rejected");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Failed to reject offer"
      );
    },
  });

  const handleAcceptOffer = (offerId: string) => {
    Alert.alert("Accept Offer", "Are you sure you want to accept this offer?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        onPress: () => acceptOfferMutation.mutate(offerId),
      },
    ]);
  };

  const handleRejectOffer = (offerId: string) => {
    Alert.alert("Reject Offer", "Are you sure you want to reject this offer?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => rejectOfferMutation.mutate(offerId),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="py-20 items-center">
        <ActivityIndicator size="large" color="#0D3F81" />
        <Text className="text-base font-inter-medium text-neutral-600 mt-4">
          Loading offers...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-20 items-center px-6">
        <Text className="text-5xl mb-4">⚠️</Text>
        <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2">
          Failed to load offers
        </Text>
      </View>
    );
  }

  const offers: Offer[] = offersData || [];
  const pendingOffers = offers.filter((o) => o.status === "pending");

  if (offers.length === 0) {
    return (
      <View className="py-20 items-center px-6">
        <TagRegularIcon size={100} color="#6B7280" />
        <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2 mt-4">
          No offers yet
        </Text>
        <Text className="text-sm font-inter-regular text-neutral-500 text-center">
          Offers from buyers will appear here
        </Text>
      </View>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <View className="bg-warning-50 px-2 py-1 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-warning-700">
              Pending
            </Text>
          </View>
        );
      case "accepted":
        return (
          <View className="bg-success-50 px-2 py-1 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-success-700">
              Accepted
            </Text>
          </View>
        );
      case "rejected":
        return (
          <View className="bg-error-50 px-2 py-1 rounded-lg">
            <Text className="text-xs font-inter-semiBold text-error-700">
              Rejected
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="px-4 pt-4 pb-8">
      {/* Pending Offers Summary */}
      {pendingOffers.length > 0 && (
        <View className="bg-warning-50 rounded-xl p-4 mb-4 border border-warning-200">
          <Text className="text-sm font-inter-semiBold text-warning-900">
            {pendingOffers.length} pending{" "}
            {pendingOffers.length === 1 ? "offer" : "offers"} awaiting your
            response
          </Text>
        </View>
      )}

      {/* Offers List */}
      {offers.map((offer) => (
        <View
          key={offer.id}
          className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 border border-neutral-100"
        >
          {/* Product and Offer Info */}
          <View className="flex-row p-3 border-b border-neutral-100">
            {/* Product Image */}
            <View className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-200 mr-3">
              {offer.product.coverImage ? (
                <Image
                  source={{ uri: offer.product.coverImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <TagRegularIcon size={24} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Offer Details */}
            <View className="flex-1">
              {getStatusBadge(offer.status)}
              <Text
                className="text-sm font-inter-semiBold text-neutral-900 mt-2 mb-1"
                numberOfLines={1}
              >
                {offer.product.title}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-inter-regular text-neutral-500 line-through">
                  ₱{parseFloat(offer.product.price).toLocaleString()}
                </Text>
                <Text className="text-base font-inter-bold text-primary-500">
                  ₱{parseFloat(offer.offerAmount).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Buyer Info */}
          <View className="px-3 py-2 border-b border-neutral-100">
            <View className="flex-row items-center">
              {offer.buyer.avatarUrl ? (
                <Image
                  source={{ uri: offer.buyer.avatarUrl }}
                  className="w-8 h-8 rounded-full mr-2"
                />
              ) : (
                <View className="w-8 h-8 rounded-full mr-2 bg-primary-100 items-center justify-center">
                  <Text className="text-xs font-inter-medium text-primary-500">
                    {offer.buyer.displayName.charAt(0)}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-xs font-inter-medium text-neutral-600">
                  Offer from
                </Text>
                <Text className="text-sm font-inter-semiBold text-neutral-800">
                  {offer.buyer.displayName}
                </Text>
              </View>
              <Text className="text-xs font-inter-regular text-neutral-500">
                {new Date(offer.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Action Buttons (only for pending offers) */}
          {offer.status === "pending" && (
            <View className="flex-row p-3 gap-2">
              <TouchableOpacity
                onPress={() => handleRejectOffer(offer.id)}
                className="flex-1 py-3 rounded-xl bg-neutral-100"
                disabled={
                  rejectOfferMutation.isPending || acceptOfferMutation.isPending
                }
              >
                <Text className="text-center text-sm font-inter-semiBold text-neutral-700">
                  Reject
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAcceptOffer(offer.id)}
                className="flex-1 py-3 rounded-xl bg-primary-500"
                disabled={
                  acceptOfferMutation.isPending || rejectOfferMutation.isPending
                }
              >
                <Text className="text-center text-sm font-inter-semiBold text-white">
                  {acceptOfferMutation.isPending ? "Accepting..." : "Accept"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
