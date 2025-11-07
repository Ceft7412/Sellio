import React, { useMemo, useRef } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Bidder {
  id: string;
  bidAmount: string;
  status: string;
  createdAt: string;
  bidder: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    verified: boolean | null;
  };
}

interface BiddersBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  bids: Bidder[];
  isLoading: boolean;
}

export default function BiddersBottomSheet({
  visible,
  onClose,
  bids,
  isLoading,
}: BiddersBottomSheetProps) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%", "75%"], []);
  const insets = useSafeAreaInsets();
  // Open/close bottom sheet modal based on visible prop
  React.useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = React.useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderBidItem = ({ item, index }: { item: Bidder; index: number }) => {
    const isHighest = index === 0;

    return (
      <View
        className={`py-4 px-4 border-b border-neutral-100 flex-row items-center justify-between ${
          isHighest ? "bg-success-50" : "bg-white"
        }`}
      >
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-inter-semiBold text-neutral-900 mr-2">
              {item.bidder.displayName}
            </Text>
            {isHighest && (
              <View className="bg-success-500 px-2 py-0.5 rounded">
                <Text className="text-xs font-inter-semiBold text-white">
                  Highest
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs font-inter-regular text-neutral-500">
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <Text className="text-lg font-inter-bold text-neutral-900">
          ₱{parseFloat(item.bidAmount).toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }}
    >
      <BottomSheetView className={`flex-1 bg-white pb-20`}>
        {/* Header */}
        <View className="px-6 py-4 border-b border-neutral-100">
          <Text className="text-xl font-inter-bold text-neutral-900">
            Bidders
          </Text>
          <Text className="text-sm font-inter-regular text-neutral-500 mt-1">
            {bids.length} {bids.length === 1 ? "bid" : "bids"} placed
          </Text>
        </View>

        {/* Bidders List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : bids.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 pt-4">
            <Text className="text-base font-inter-medium text-neutral-900 mb-2">
              No Bids Yet
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-500 text-center">
              Be the first to place a bid on this item!
            </Text>
          </View>
        ) : (
          <FlatList
            data={bids}
            renderItem={renderBidItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
