import React from "react";
import { View } from "react-native";
import { Skeleton } from "./Skeleton";

interface CategoryLoadingStateProps {
  count?: number;
}

/**
 * Loading state component for Category Screen
 * Uses the reusable Skeleton component to create category card skeletons
 */
export const CategoryLoadingState: React.FC<CategoryLoadingStateProps> = ({
  count = 6,
}) => {
  return (
    <View className="flex-row flex-wrap justify-between pt-2">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="w-[48%] mb-4 bg-white rounded-2xl overflow-hidden shadow-sm"
        >
          {/* Category Image Skeleton */}
          <Skeleton width="100%" height={128} borderRadius={0} />

          {/* Category Info Skeleton */}
          <View className="p-3">
            {/* Category Name */}
            <Skeleton
              width="80%"
              height={16}
              borderRadius={4}
              className="mb-2"
            />
            {/* Product Count */}
            <Skeleton width="50%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};
