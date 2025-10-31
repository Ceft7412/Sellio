import React from "react";
import { View, ScrollView } from "react-native";
import { Skeleton } from "./Skeleton";

interface CategoryHorizontalLoadingStateProps {
  count?: number;
}

/**
 * Loading state component for horizontal Category list
 * Uses the reusable Skeleton component to create horizontal category card skeletons
 */
export const CategoryHorizontalLoadingState: React.FC<
  CategoryHorizontalLoadingStateProps
> = ({ count = 6 }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="mr-3 w-24">
          {/* Category Image Skeleton */}
          <Skeleton width={96} height={96} borderRadius={16} className="mb-2" />
          {/* Category Name Skeleton */}
          <Skeleton width={96} height={12} borderRadius={4} />
        </View>
      ))}
    </ScrollView>
  );
};
