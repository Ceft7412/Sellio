import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import {
  ChevronLeftRegularIcon,
  MoreVerticalRegularIcon,
} from "../../icons/outline/chevron-left";
import { CheckmarkCircleRegularIcon } from "../../icons/outline/check-mark-outline";
import { OfferActions } from "./transaction-actions/OfferActions";
import { MeetupActions } from "./transaction-actions/MeetupActions";

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

interface OfferDetails {
  id: string;
  amount: string;
  status: "pending" | "accepted" | "rejected" | "expired" | "withdrawn";
  buyerId: string;
  sellerId: string;
}

interface TransactionDetails {
  id: string;
  status: string;
  meetupStatus: string;
  scheduledMeetupAt: string | null;
  meetupLocation: string | null;
  meetupCoordinates: any;
  meetupProposedBy: string | null;
  agreedPrice: string;
  buyerId: string;
  sellerId: string;
}

interface ChatHeaderProps {
  chatUser: ChatUser;
  offer?: OfferDetails | null;
  transaction?: TransactionDetails | null;
  currentUserId: string;
  conversationId: string;
  onBack: () => void;
  onViewTransactionDetails?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatUser,
  offer,
  transaction,
  currentUserId,
  conversationId,
  onBack,
  onViewTransactionDetails,
}) => {
  return (
    <View>
      {/* Header */}
      <View className="px-4 py-3 border-b border-neutral-200 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={onBack}
            className="mr-3 w-10 h-10 items-center justify-center"
          >
            <ChevronLeftRegularIcon size={24} color="#111827" />
          </TouchableOpacity>
          {chatUser.avatar ? (
            <Image
              source={{ uri: chatUser.avatar }}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full mr-3 bg-primary-100 items-center justify-center">
              <Text className="text-lg font-inter-medium text-primary-500">
                {chatUser.name.charAt(0)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="font-inter-semiBold text-base text-neutral-900 mr-1">
                {chatUser.name}
              </Text>
              {chatUser.verified && (
                <CheckmarkCircleRegularIcon size={16} color="#10B981" />
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <MoreVerticalRegularIcon size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Offer Amount Banner */}
      {offer && (
        <View className="bg-warning-50 border-b border-warning-200 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-inter-medium text-warning-700 mb-0.5">
                {offer.status === "accepted" ? "Accepted Offer" :
                 offer.status === "rejected" ? "Declined Offer" :
                 "Offer Amount"}
              </Text>
              <Text className="text-lg font-inter-bold text-warning-800">
                ₱{parseFloat(offer.amount).toLocaleString()}
              </Text>
            </View>
            <View className={`px-3 py-1.5 rounded-lg ${
              offer.status === "accepted" ? "bg-success-500" :
              offer.status === "rejected" ? "bg-error-500" :
              "bg-warning-500"
            }`}>
              <Text className="text-xs font-inter-semiBold text-white">
                {offer.status === "accepted" ? "Accepted" :
                 offer.status === "rejected" ? "Declined" :
                 "Pending"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Offer Action Buttons */}
      {offer && (
        <OfferActions
          offer={offer}
          currentUserId={currentUserId}
          conversationId={conversationId}
        />
      )}

      {/* Meetup Action Buttons */}
      {transaction && offer && (
        <MeetupActions
          transaction={transaction}
          currentUserId={currentUserId}
          conversationId={conversationId}
          buyerId={offer.buyerId}
          sellerId={offer.sellerId}
          onViewDetails={onViewTransactionDetails}
        />
      )}
    </View>
  );
};
