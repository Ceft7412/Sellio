import { View, Text } from "react-native";
import React from "react";

interface BidDetails {
  id: string;
  bidAmount: string;
  status: "active" | "won" | "lost" | "outbid" | "expired" | "completed";
  bidderId: string;
  productId: string;
}

interface BidActionsProps {
  bid: BidDetails;
  currentUserId: string;
  conversationId: string;
}

export const BidActions: React.FC<BidActionsProps> = ({
  bid,
  currentUserId,
  conversationId,
}) => {
  const isWinner = currentUserId === bid.bidderId && bid.status === "won";

  // Show confirmation message for winner
  if (isWinner) {
    return (
      <View className="px-4 py-3 bg-success-50 border-t border-success-200">
        <Text className="text-sm font-inter-medium text-success-700 text-center">
          Congratulations! You won this bid. Please schedule a meetup to complete the transaction.
        </Text>
      </View>
    );
  }

  // Don't show actions for non-winners or other statuses
  return null;
};
