import React from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { Skeleton } from "./Skeleton";

const { width } = Dimensions.get("window");

/**
 * Loading state component for Product Details Screen
 * Uses the reusable Skeleton component to create product detail skeletons
 */
export const ProductDetailsLoadingState: React.FC = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Image Gallery Skeleton */}
      <Skeleton width={width} height={400} borderRadius={0} />

      {/* Product Info */}
      <View className="px-6 py-4">
        {/* Category & Type Badges */}
        <View className="flex-row items-center mb-3">
          <Skeleton width={80} height={24} borderRadius={8} className="mr-2" />
          <Skeleton width={90} height={24} borderRadius={8} />
        </View>

        {/* Title - 2 lines */}
        <Skeleton width="100%" height={24} borderRadius={6} className="mb-2" />
        <Skeleton width="80%" height={24} borderRadius={6} className="mb-4" />

        {/* Price */}
        <Skeleton width={150} height={32} borderRadius={8} className="mb-4" />

        {/* Location & Condition */}
        <View className="flex-row items-center mb-4">
          <Skeleton width={120} height={16} borderRadius={4} className="mr-4" />
          <Skeleton width={80} height={24} borderRadius={8} />
        </View>

        {/* Seller Info Card */}
        <View className="flex-row items-center p-4 bg-neutral-50 rounded-2xl mb-4">
          {/* Avatar */}
          <Skeleton width={56} height={56} borderRadius={28} className="mr-3" />
          <View className="flex-1">
            {/* Seller Name */}
            <Skeleton width="60%" height={16} borderRadius={4} className="mb-2" />
            {/* Rating */}
            <Skeleton width="40%" height={12} borderRadius={4} />
          </View>
        </View>

        {/* Description Section */}
        <View className="mb-4">
          <Skeleton width={120} height={20} borderRadius={6} className="mb-3" />
          <Skeleton width="100%" height={14} borderRadius={4} className="mb-2" />
          <Skeleton width="100%" height={14} borderRadius={4} className="mb-2" />
          <Skeleton width="100%" height={14} borderRadius={4} className="mb-2" />
          <Skeleton width="85%" height={14} borderRadius={4} />
        </View>

        {/* Specifications Section */}
        <View className="mb-4">
          <Skeleton width={140} height={20} borderRadius={6} className="mb-3" />
          <View className="bg-neutral-50 rounded-2xl overflow-hidden p-4">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View
                key={index}
                className={`flex-row items-center justify-between py-3 ${
                  index !== 4 ? "border-b border-neutral-200" : ""
                }`}
              >
                <Skeleton width={80} height={12} borderRadius={4} />
                <Skeleton width={100} height={12} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom spacing for action buttons */}
      <View className="h-32" />
    </ScrollView>
  );
};
