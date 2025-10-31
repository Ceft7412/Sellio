import React from "react";
import { View } from "react-native";
import { Skeleton } from "./Skeleton";

interface ProductsGridLoadingStateProps {
  count?: number;
}

/**
 * Single Product Card Skeleton
 */
const ProductCardSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
      {/* Product Image Skeleton */}
      <Skeleton width="100%" height={192} borderRadius={0} />

      {/* Product Info */}
      <View className="p-3">
        {/* Title - 2 lines */}
        <Skeleton width="100%" height={14} borderRadius={4} className="mb-1" />
        <Skeleton width="80%" height={14} borderRadius={4} className="mb-3" />

        {/* Price */}
        <Skeleton width="60%" height={18} borderRadius={4} className="mb-3" />

        {/* Location */}
        <View className="flex-row items-center mb-3 gap-1">
          <Skeleton width={16} height={16} borderRadius={4} />
          <Skeleton width="60%" height={12} borderRadius={4} />
        </View>

        {/* Seller Info */}
        <View className="flex-row items-center pt-3 border-t border-neutral-100">
          {/* Avatar */}
          <Skeleton width={32} height={32} borderRadius={16} className="mr-2" />
          <View className="flex-1">
            <Skeleton width="70%" height={12} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * Loading state component for Products Grid (two-column layout)
 * Uses the reusable Skeleton component to create product card skeletons
 */
export const ProductsGridLoadingState: React.FC<
  ProductsGridLoadingStateProps
> = ({ count = 6 }) => {
  const leftColumnCount = Math.ceil(count / 2);
  const rightColumnCount = Math.floor(count / 2);

  return (
    <View className="flex-row">
      {/* Left Column */}
      <View className="flex-1 mr-1">
        {Array.from({ length: leftColumnCount }).map((_, index) => (
          <ProductCardSkeleton key={`left-${index}`} />
        ))}
      </View>

      {/* Right Column */}
      <View className="flex-1 ml-1">
        {Array.from({ length: rightColumnCount }).map((_, index) => (
          <ProductCardSkeleton key={`right-${index}`} />
        ))}
      </View>
    </View>
  );
};
