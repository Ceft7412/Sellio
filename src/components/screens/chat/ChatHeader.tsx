import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import {
  ChevronLeftRegularIcon,
  MoreVerticalRegularIcon,
} from "../../icons/outline/chevron-left";
import { CheckmarkCircleRegularIcon } from "../../icons/outline/check-mark-outline";
import { OfferActions } from "./transaction-actions/OfferActions";
import { BuyActions } from "./transaction-actions/BuyActions";
import { BidActions } from "./transaction-actions/BidActions";
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
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "expired"
    | "withdrawn"
    | "cancelled";
  buyerId: string;
  sellerId: string;
}

interface BuyDetails {
  id: string;
  amount: string;
  status:
    | "pending"
    | "confirmed_pending_meetup"
    | "cancelled_by_buyer"
    | "cancelled_by_seller"
    | "expired"
    | "completed";
  buyerId: string;
  sellerId: string;
}

interface BidDetails {
  id: string;
  bidAmount: string;
  status: "active" | "won" | "lost" | "outbid" | "expired" | "completed";
  bidderId: string;
  productId: string;
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
  buy?: BuyDetails | null;
  bid?: BidDetails | null;
  transaction?: TransactionDetails | null;
  currentUserId: string;
  conversationId: string;
  onBack: () => void;
  onViewTransactionDetails?: () => void;
  onOpenOptions?: () => void;
  onReview?: () => void;
  hasReviewed?: boolean;
  checkingReviewStatus?: boolean;
  onViewProfile?: () => void;
  onTransactionComplete?: (data: any) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatUser,
  offer,
  buy,
  bid,
  transaction,
  currentUserId,
  conversationId,
  onBack,
  onViewTransactionDetails,
  onOpenOptions,
  onReview,
  hasReviewed = false,
  checkingReviewStatus = false,
  onViewProfile,
  onTransactionComplete,
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
          <TouchableOpacity
            onPress={onViewProfile}
            className="flex-row items-center flex-1"
            activeOpacity={0.7}
          >
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
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={onOpenOptions}
          className="w-10 h-10 items-center justify-center"
        >
          <MoreVerticalRegularIcon size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Offer Amount Banner - Hide when transaction is completed */}
      {offer && transaction?.status !== "completed" && (
        <View
          className={`border-b px-4 py-3 ${
            offer.status === "cancelled" ||
            transaction?.status?.includes("cancelled")
              ? "bg-neutral-50 border-neutral-200"
              : "bg-warning-50 border-warning-200"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text
                className={`text-xs font-inter-medium mb-0.5 ${
                  offer.status === "cancelled" ||
                  transaction?.status?.includes("cancelled")
                    ? "text-neutral-600"
                    : "text-warning-700"
                }`}
              >
                {offer.status === "accepted"
                  ? "Accepted Offer"
                  : offer.status === "rejected"
                  ? "Declined Offer"
                  : offer.status === "cancelled" ||
                    transaction?.status?.includes("cancelled")
                  ? "Cancelled Offer"
                  : "Offer Amount"}
              </Text>
              <Text
                className={`text-lg font-inter-bold ${
                  offer.status === "cancelled" ||
                  transaction?.status?.includes("cancelled")
                    ? "text-neutral-700"
                    : "text-warning-800"
                }`}
              >
                ₱{parseFloat(offer.amount).toLocaleString()}
              </Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg ${
                offer.status === "accepted"
                  ? "bg-success-500"
                  : offer.status === "rejected"
                  ? "bg-error-500"
                  : offer.status === "cancelled" ||
                    transaction?.status?.includes("cancelled")
                  ? "bg-neutral-400"
                  : "bg-warning-500"
              }`}
            >
              <Text className="text-xs font-inter-semiBold text-white">
                {offer.status === "accepted"
                  ? "Accepted"
                  : offer.status === "rejected"
                  ? "Declined"
                  : offer.status === "cancelled" ||
                    transaction?.status?.includes("cancelled")
                  ? "Cancelled"
                  : "Pending"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Buy Amount Banner - Hide when transaction is completed */}
      {buy && transaction?.status !== "completed" && (
        <View
          className={`border-b px-4 py-3 ${
            buy.status?.includes("cancelled") ||
            transaction?.status?.includes("cancelled")
              ? "bg-neutral-50 border-neutral-200"
              : "bg-primary-50 border-primary-200"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text
                className={`text-xs font-inter-medium mb-0.5 ${
                  buy.status?.includes("cancelled") ||
                  transaction?.status?.includes("cancelled")
                    ? "text-neutral-600"
                    : "text-primary-700"
                }`}
              >
                {buy.status === "confirmed_pending_meetup"
                  ? "Confirmed Purchase"
                  : buy.status?.includes("cancelled") ||
                    transaction?.status?.includes("cancelled")
                  ? "Cancelled Purchase"
                  : "Buy Now Amount"}
              </Text>
              <Text
                className={`text-lg font-inter-bold ${
                  buy.status?.includes("cancelled") ||
                  transaction?.status?.includes("cancelled")
                    ? "text-neutral-700"
                    : "text-primary-800"
                }`}
              >
                ₱{parseFloat(buy.amount).toLocaleString()}
              </Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg ${
                buy.status === "confirmed_pending_meetup"
                  ? "bg-success-500"
                  : buy.status?.includes("cancelled") ||
                    transaction?.status?.includes("cancelled")
                  ? "bg-neutral-400"
                  : "bg-primary-500"
              }`}
            >
              <Text className="text-xs font-inter-semiBold text-white">
                {buy.status === "confirmed_pending_meetup"
                  ? "Confirmed"
                  : buy.status?.includes("cancelled") ||
                    transaction?.status?.includes("cancelled")
                  ? "Cancelled"
                  : "Pending"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Bid Amount Banner - Hide when transaction is completed */}
      {bid && transaction?.status !== "completed" && (
        <View
          className={`border-b px-4 py-3 ${
            transaction?.status?.includes("cancelled")
              ? "bg-neutral-50 border-neutral-200"
              : "bg-success-50 border-success-200"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text
                className={`text-xs font-inter-medium mb-0.5 ${
                  transaction?.status?.includes("cancelled")
                    ? "text-neutral-600"
                    : "text-success-700"
                }`}
              >
                {transaction?.status?.includes("cancelled")
                  ? "Cancelled Bid"
                  : "Winning Bid"}
              </Text>
              <Text
                className={`text-lg font-inter-bold ${
                  transaction?.status?.includes("cancelled")
                    ? "text-neutral-700"
                    : "text-success-800"
                }`}
              >
                ₱{parseFloat(bid.bidAmount).toLocaleString()}
              </Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg ${
                bid.status === "won"
                  ? "bg-success-500"
                  : transaction?.status?.includes("cancelled")
                  ? "bg-neutral-400"
                  : "bg-warning-500"
              }`}
            >
              <Text className="text-xs font-inter-semiBold text-white">
                {bid.status === "won"
                  ? "Won"
                  : transaction?.status?.includes("cancelled")
                  ? "Cancelled"
                  : bid.status === "outbid"
                  ? "Outbid"
                  : "Active"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Offer Action Buttons - Hide when transaction is completed or cancelled */}
      {offer &&
        transaction?.status !== "completed" &&
        !transaction?.status?.includes("cancelled") &&
        offer.status !== "cancelled" && (
          <OfferActions
            offer={offer}
            currentUserId={currentUserId}
            conversationId={conversationId}
          />
        )}

      {/* Buy Action Buttons - Hide when transaction is completed or cancelled */}
      {buy &&
        transaction?.status !== "completed" &&
        !transaction?.status?.includes("cancelled") &&
        !buy.status?.includes("cancelled") && (
          <BuyActions
            buy={buy}
            currentUserId={currentUserId}
            conversationId={conversationId}
          />
        )}

      {/* Bid Action Buttons - Hide when transaction is completed or cancelled */}
      {bid &&
        transaction?.status !== "completed" &&
        !transaction?.status?.includes("cancelled") &&
        bid.status === "won" && (
          <BidActions
            bid={bid}
            currentUserId={currentUserId}
            conversationId={conversationId}
          />
        )}

      {/* Meetup Action Buttons - Hide when transaction is cancelled */}
      {transaction &&
        (offer || buy || bid) &&
        !transaction?.status?.includes("cancelled") && (
          <MeetupActions
            transaction={transaction}
            currentUserId={currentUserId}
            conversationId={conversationId}
            buyerId={
              offer?.buyerId ||
              buy?.buyerId ||
              bid?.bidderId ||
              transaction.buyerId
            }
            sellerId={offer?.sellerId || buy?.sellerId || transaction.sellerId}
            onViewDetails={onViewTransactionDetails}
            isBuyNow={!!buy && !offer && !bid}
            isBid={!!bid && !offer && !buy}
            onTransactionComplete={onTransactionComplete}
          />
        )}

      {/* Review Button - Show only when transaction is completed, not checking status, and user hasn't reviewed */}
      {transaction &&
        transaction.status === "completed" &&
        (offer || buy || bid) &&
        !checkingReviewStatus &&
        !hasReviewed && (
          <View className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <TouchableOpacity
              onPress={onReview}
              className="bg-primary-500 rounded-lg py-3 items-center"
            >
              <Text className="text-sm font-inter-semiBold text-white">
                Leave a Review
              </Text>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );
};
