import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useRoute,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftRegularIcon } from "../../components/icons/outline/chevron-left";
import { CheckmarkCircleRegularIcon } from "../../components/icons/outline/check-mark-outline";
import { StarColorIcon } from "../../components/icons/fill/star-color-fill";
import { ShareRegularIcon } from "../../components/icons/outline/redirect-outline";
import { usersAPI } from "../../constants/axios";
import { format } from "date-fns";

interface RouteParams {
  userId: string;
}

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  isAnonymous: boolean;
  createdAt: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  blockchainTxHash?: string;
}

type TabType = "seller" | "buyer";

export default function UserProfileScreen({ navigation }: { navigation: any }) {
  const route = useRoute();
  const { userId } = route.params as RouteParams;
  const [activeTab, setActiveTab] = useState<TabType>("seller");

  const { data, isLoading, error } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const response = await usersAPI.getUserProfile(userId);
      return response.data;
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleVerifyBusiness = async () => {
    const url = "https://bnrs.dti.gov.ph/search";
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarColorIcon
            key={star}
            size={16}
            color={star <= rating ? "#F59E0B" : "#D1D5DB"}
          />
        ))}
      </View>
    );
  };

  const renderReviewCard = (review: Review) => {
    return (
      <View
        key={review.id}
        className="bg-white p-4 rounded-xl border border-neutral-200 mb-3"
      >
        {/* Reviewer Info */}
        <View className="flex-row items-center mb-3">
          {review.reviewerAvatar ? (
            <Image
              source={{ uri: review.reviewerAvatar }}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full mr-3 bg-primary-100 items-center justify-center">
              <Text className="text-base font-inter-medium text-primary-500">
                {review.reviewerName.charAt(0)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-sm font-inter-semiBold text-neutral-900">
              {review.reviewerName}
            </Text>
            <View className="flex-row items-center mt-0.5">
              {renderStars(review.rating)}
              <Text className="text-xs font-inter-regular text-neutral-500 ml-2">
                {format(new Date(review.createdAt), "MMM dd, yyyy")}
              </Text>
            </View>
          </View>
        </View>

        {/* Review Text */}
        <Text className="text-sm font-inter-regular text-neutral-700 leading-5">
          {review.reviewText}
        </Text>

        {/* Blockchain Hash */}
        {review.blockchainTxHash && (
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `https://sepolia.etherscan.io/tx/${review.blockchainTxHash}`
              )
            }
            className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex-row items-center"
          >
            <View className="flex-1 mr-2">
              <Text className="text-xs font-inter-medium text-blue-700 mb-0.5">
                View on Etherscan
              </Text>
              <Text
                className="text-xs font-inter-regular text-blue-600"
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {review.blockchainTxHash}
              </Text>
            </View>
            <Text className="text-blue-500 text-base font-inter-semiBold">
              ↗
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D3F81" />
          <Text className="text-base font-inter-medium text-neutral-600 mt-4">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-inter-bold text-neutral-900 mb-2">
            Profile Not Found
          </Text>
          <Text className="text-base font-inter-regular text-neutral-600 text-center mb-6">
            Unable to load user profile
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

  const { user, sellerRating, buyerRating, sellerReviews, buyerReviews } = data;

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-neutral-200 flex-row items-center">
        <TouchableOpacity
          onPress={handleBack}
          className="mr-3 w-10 h-10 items-center justify-center"
        >
          <ChevronLeftRegularIcon size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-inter-bold text-neutral-900 flex-1">
          User Profile
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View className="bg-white p-6 border-b border-neutral-200">
          <View className="items-center">
            {user.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                className="w-24 h-24 rounded-full mb-4"
              />
            ) : (
              <View className="w-24 h-24 rounded-full mb-4 bg-primary-100 items-center justify-center">
                <Text className="text-4xl font-inter-bold text-primary-500">
                  {user.displayName?.charAt(0) || "?"}
                </Text>
              </View>
            )}

            <View className="flex-row items-center mb-2">
              <Text className="text-xl font-inter-bold text-neutral-900 mr-2">
                {user.displayName || "Unknown User"}
              </Text>
              {user.identityVerified && (
                <CheckmarkCircleRegularIcon size={20} color="#10B981" />
              )}
            </View>

            <Text className="text-sm font-inter-regular text-neutral-500">
              Member since {format(new Date(user.createdAt), "MMMM yyyy")}
            </Text>
          </View>

          {/* Business Documents Badge */}
          {user.businessDocuments && (
            <View className="mt-4 px-4 py-2 bg-primary-50 rounded-lg items-center">
              <Text className="text-xs font-inter-semiBold text-primary-700">
                Verified Business Account
              </Text>
            </View>
          )}
        </View>

        {/* Business Documents Section */}
        {user.businessDocuments && user.businessDocuments.url && (
          <View className="bg-white p-4 border-b border-neutral-200">
            <Text className="text-base font-inter-bold text-neutral-900 mb-3">
              Business Documents
            </Text>

            {/* Document Image - Clickable */}
            <TouchableOpacity
              onPress={() => {
                // Open full image view
                navigation.navigate("general", {
                  screen: "imageViewer",
                  params: { imageUrl: user.businessDocuments.url },
                } as never);
              }}
              className="mb-2"
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: user.businessDocuments.url }}
                className="w-32 h-32 rounded-xl"
                resizeMode="cover"
              />
            </TouchableOpacity>

            <Text className="text-xs font-inter-regular text-neutral-500 mb-3">
              Tap image to view full size
            </Text>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerifyBusiness}
              className="flex-row items-center justify-center px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl active:bg-primary-100"
              activeOpacity={0.7}
            >
              <ShareRegularIcon size={18} color="#0D3F81" />
              <Text className="text-sm font-inter-semiBold text-primary-700 ml-2">
                Verify Business Registration
              </Text>
            </TouchableOpacity>

            <Text className="text-xs font-inter-regular text-neutral-500 text-center mt-2">
              Opens DTI Business Name Registration Search
            </Text>
          </View>
        )}

        {/* Rating Summary Cards */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row gap-3">
            {/* Seller Rating Card */}
            <View className="flex-1 bg-white rounded-xl p-4 border border-neutral-200">
              <Text className="text-xs font-inter-medium text-neutral-500 mb-1">
                As Seller
              </Text>
              <View className="flex-row items-center">
                <StarColorIcon size={20} color="#F59E0B" />
                <Text className="text-2xl font-inter-bold text-neutral-900 ml-2">
                  {sellerRating.averageRating || "N/A"}
                </Text>
              </View>
              <Text className="text-xs font-inter-regular text-neutral-500 mt-1">
                {sellerRating.totalReviews}{" "}
                {sellerRating.totalReviews === 1 ? "review" : "reviews"}
              </Text>
            </View>

            {/* Buyer Rating Card */}
            <View className="flex-1 bg-white rounded-xl p-4 border border-neutral-200">
              <Text className="text-xs font-inter-medium text-neutral-500 mb-1">
                As Buyer
              </Text>
              <View className="flex-row items-center">
                <StarColorIcon size={20} color="#F59E0B" />
                <Text className="text-2xl font-inter-bold text-neutral-900 ml-2">
                  {buyerRating.averageRating || "N/A"}
                </Text>
              </View>
              <Text className="text-xs font-inter-regular text-neutral-500 mt-1">
                {buyerRating.totalReviews}{" "}
                {buyerRating.totalReviews === 1 ? "review" : "reviews"}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row bg-neutral-100 rounded-xl p-1">
            <TouchableOpacity
              onPress={() => setActiveTab("seller")}
              className={`flex-1 py-2 rounded-lg ${
                activeTab === "seller" ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-center text-sm font-inter-semiBold ${
                  activeTab === "seller"
                    ? "text-primary-500"
                    : "text-neutral-600"
                }`}
              >
                Seller Reviews ({sellerRating.totalReviews})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("buyer")}
              className={`flex-1 py-2 rounded-lg ${
                activeTab === "buyer" ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-center text-sm font-inter-semiBold ${
                  activeTab === "buyer"
                    ? "text-primary-500"
                    : "text-neutral-600"
                }`}
              >
                Buyer Reviews ({buyerRating.totalReviews})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews List */}
        <View className="px-4 py-2">
          {activeTab === "seller" && (
            <>
              {sellerReviews.length > 0 ? (
                sellerReviews.map((review: any) => renderReviewCard(review))
              ) : (
                <View className="bg-white rounded-xl p-8 items-center border border-neutral-200">
                  <Text className="text-base font-inter-medium text-neutral-600 text-center">
                    No seller reviews yet
                  </Text>
                </View>
              )}
            </>
          )}

          {activeTab === "buyer" && (
            <>
              {buyerReviews.length > 0 ? (
                buyerReviews.map((review: any) => renderReviewCard(review))
              ) : (
                <View className="bg-white rounded-xl p-8 items-center border border-neutral-200">
                  <Text className="text-base font-inter-medium text-neutral-600 text-center">
                    No buyer reviews yet
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
