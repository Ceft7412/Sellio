import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React, { useMemo, useRef, useEffect, useState } from "react";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useAuthStore } from "../../store/authStore";
import LocationSharingCard from "../LocationSharingCard";
import TransactionCancellationModal from "../modals/TransactionCancellationModal";
import { transactionsAPI } from "../../constants/axios";
import { ScrollView } from "react-native-gesture-handler";
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

interface Product {
  id: string;
  title: string;
  price?: string;
  imageUrl: string | null;
}

interface OppositeUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  identityVerified: boolean;
}

interface Offer {
  id: string;
  amount: string;
  status: string;
  buyerId: string;
  sellerId: string;
}

interface Buy {
  id: string;
  amount: string;
  status: string;
  buyerId: string;
  sellerId: string;
}

interface Bid {
  id: string;
  bidAmount: string;
  status: string;
  bidderId: string;
  productId: string;
}

interface TransactionDetailsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  transaction: TransactionDetails;
  product: Product | null;
  oppositeUser: OppositeUser | null;
  offer: Offer | null;
  buy: Buy | null;
  bid: Bid | null;
  conversationId: string;
  navigation?: any; // Optional navigation prop
  // Location sharing props (passed from parent)
  isSharing: boolean;
  oppositeUserSharing: boolean;
  myDistance: string | null;
  oppositeUserDistance: string | null;
  nearbyPlaces: any[];
  startSharing: () => void;
  stopSharing: () => void;
  isStarting: boolean;
  isStopping: boolean;
}

export default function TransactionDetailsBottomSheet({
  visible,
  onClose,
  transaction,
  product,
  oppositeUser,
  offer,
  buy,
  bid,
  conversationId,
  navigation,
  // Location sharing props
  isSharing,
  oppositeUserSharing,
  myDistance,
  oppositeUserDistance,
  nearbyPlaces,
  startSharing,
  stopSharing,
  isStarting,
  isStopping,
}: TransactionDetailsBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { user } = useAuthStore();
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Snap points
  const snapPoints = useMemo(() => ["45%", "65%", "85%"], []);

  // Control visibility
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Determine participants
  const isBuyer = user?.id === transaction.buyerId;

  // Check if cancellation is allowed (1 hour before meetup restriction)
  const canCancelTransaction = useMemo(() => {
    if (!transaction.scheduledMeetupAt) return true;

    const meetupTime = new Date(transaction.scheduledMeetupAt);
    const now = new Date();
    const oneHourBeforeMeetup = new Date(meetupTime.getTime() - 60 * 60 * 1000);

    return now < oneHourBeforeMeetup;
  }, [transaction.scheduledMeetupAt]);

  // Handle transaction cancellation
  const handleCancelTransaction = async (
    reason: string,
    customReason?: string
  ) => {
    try {
      setIsCancelling(true);

      await transactionsAPI.cancelTransaction(transaction.id, {
        reason,
        customReason,
      });

      // Close modal and bottomsheet immediately
      setShowCancellationModal(false);
      onClose();

      // Navigate to chat screen if navigation is available
      if (navigation) {
        setTimeout(() => {
          navigation.navigate("general", {
            screen: "chat",
            params: { conversationId },
          } as never);
        }, 100);
      }

      // Show success message
      setTimeout(() => {
        Alert.alert(
          "Transaction Cancelled",
          "The transaction has been cancelled successfully."
        );
      }, 300);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.error ||
          "Failed to cancel transaction. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing={false}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }}
    >
      <BottomSheetScrollView
        className="px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <View className="mb-4">
          <Text className="text-xl font-inter-bold text-neutral-900">
            Transaction Details
          </Text>
        </View>

        {nearbyPlaces && nearbyPlaces.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-inter-semiBold text-neutral-800 mb-3">
              Nearby Places
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row ">
                {nearbyPlaces.map((place: any, index: number) => (
                  <View key={index} className="mr-3 w-40">
                    <Image
                      source={{
                        uri:
                          place.photoUrl ||
                          "https://via.placeholder.com/150?text=No+Image",
                      }}
                      className="w-full h-24 rounded-lg bg-neutral-200"
                    />
                    <Text
                      className="text-sm font-inter-medium text-neutral-800 mt-2"
                      numberOfLines={2}
                    >
                      {place.name}
                    </Text>
                    <Text
                      className="text-xs font-inter-regular text-neutral-500"
                      numberOfLines={1}
                    >
                      {place.address}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
        {/* Product Details */}
        {product && (
          <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
            <Text className="text-xs font-inter-medium text-neutral-500 mb-2">
              Product
            </Text>
            <View className="flex-row items-center">
              <Image
                source={{
                  uri: product.imageUrl || "https://via.placeholder.com/80",
                }}
                className="w-16 h-16 rounded-xl mr-3"
              />
              <View className="flex-1">
                <Text
                  className="font-inter-semibold text-base text-neutral-900 mb-1"
                  numberOfLines={2}
                >
                  {product.title}
                </Text>
                <View className="flex-row items-center gap-2">
                  {offer ? (
                    <>
                      <Text className="font-inter-regular text-sm text-neutral-500 line-through">
                        ₱{parseFloat(product.price || "0").toLocaleString()}
                      </Text>
                      <Text className="font-inter-bold text-base text-primary-500">
                        ₱{parseFloat(offer.amount).toLocaleString()}
                      </Text>
                    </>
                  ) : buy ? (
                    <Text className="font-inter-bold text-base text-primary-500">
                      ₱{parseFloat(buy.amount).toLocaleString()}
                    </Text>
                  ) : bid ? (
                    <>
                      <Text className="font-inter-regular text-sm text-neutral-500 line-through">
                        ₱{parseFloat(product.price || "0").toLocaleString()}
                      </Text>
                      <Text className="font-inter-bold text-base text-success-500">
                        ₱{parseFloat(bid.bidAmount).toLocaleString()}
                      </Text>
                    </>
                  ) : (
                    <Text className="font-inter-bold text-base text-primary-500">
                      ₱{parseFloat(product.price || "0").toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Meetup Details */}
        {transaction.scheduledMeetupAt && (
          <View className="bg-info-50 rounded-2xl p-4 mb-4">
            <Text className="text-xs font-inter-medium text-info-700 mb-3">
              Meetup Schedule
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-start">
                <View>
                  <Text className="text-xs font-inter-medium text-neutral-500">
                    Date
                  </Text>
                  <Text className="text-base font-inter-semibold text-neutral-900">
                    {formatDate(transaction.scheduledMeetupAt)}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start mt-3">
                <View>
                  <Text className="text-xs font-inter-medium text-neutral-500">
                    Time
                  </Text>
                  <Text className="text-base font-inter-semibold text-neutral-900">
                    {formatTime(transaction.scheduledMeetupAt)}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start mt-3">
                <View className="flex-1">
                  <Text className="text-xs font-inter-medium text-neutral-500">
                    Location
                  </Text>
                  <Text className="text-base font-inter-regular text-neutral-900">
                    {transaction.meetupLocation}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Participants */}
        <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
          <Text className="text-xs font-inter-medium text-neutral-500 mb-3">
            Participants
          </Text>

          {/* Buyer */}
          <View className="flex-row items-center mb-3">
            {(isBuyer ? user?.avatarUrl : oppositeUser?.avatarUrl) ? (
              <Image
                source={{
                  uri:
                    (isBuyer ? user?.avatarUrl : oppositeUser?.avatarUrl) ||
                    undefined,
                }}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <View className="w-10 h-10 rounded-full mr-3 bg-primary-50 items-center justify-center">
                <Text className="text-lg font-inter-semibold text-primary-600">
                  {(isBuyer ? user?.displayName : oppositeUser?.displayName)
                    ?.charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-sm font-inter-semibold text-neutral-900 mr-2">
                  {isBuyer ? user?.displayName : oppositeUser?.displayName}
                </Text>
                {isBuyer && (
                  <View className="px-2 py-0.5 bg-primary-100 rounded">
                    <Text className="text-xs font-inter-medium text-primary-700">
                      You
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-xs font-inter-regular text-neutral-500">
                Buyer
              </Text>
            </View>
          </View>

          {/* Seller */}
          <View className="flex-row items-center">
            {(!isBuyer ? user?.avatarUrl : oppositeUser?.avatarUrl) ? (
              <Image
                source={{
                  uri:
                    (!isBuyer ? user?.avatarUrl : oppositeUser?.avatarUrl) ||
                    undefined,
                }}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <View className="w-10 h-10 rounded-full mr-3 bg-primary-50 items-center justify-center">
                <Text className="text-lg font-inter-semibold text-primary-600">
                  {(!isBuyer ? user?.displayName : oppositeUser?.displayName)
                    ?.charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-sm font-inter-semibold text-neutral-900 mr-2">
                  {!isBuyer ? user?.displayName : oppositeUser?.displayName}
                </Text>
                {!isBuyer && (
                  <View className="px-2 py-0.5 bg-primary-100 rounded">
                    <Text className="text-xs font-inter-medium text-primary-700">
                      You
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-xs font-inter-regular text-neutral-500">
                Seller
              </Text>
            </View>
          </View>
        </View>

        {/* Location Sharing Card */}
        <LocationSharingCard
          isSharing={isSharing}
          oppositeUserSharing={oppositeUserSharing}
          myDistance={myDistance}
          oppositeUserDistance={oppositeUserDistance}
          oppositeUserName={oppositeUser?.displayName}
          onStartSharing={startSharing}
          onStopSharing={stopSharing}
          isStarting={isStarting}
          isStopping={isStopping}
        />

        {/* Cancellation Warning - Show when within 1 hour of meetup */}
        {!canCancelTransaction && transaction.scheduledMeetupAt && (
          <View className="bg-warning-50 border border-warning-200 rounded-2xl p-4 mb-4">
            <Text className="text-sm font-inter-semibold text-warning-800 mb-1">
              Cancellation Not Allowed
            </Text>
            <Text className="text-xs font-inter-regular text-warning-700">
              Transactions cannot be cancelled within 1 hour of the scheduled
              meetup time.
            </Text>
          </View>
        )}

        {/* Cancel Transaction Button */}
        <TouchableOpacity
          className={`py-4 px-4 rounded-xl border items-center mb-6 ${
            canCancelTransaction
              ? "border-error-300 bg-white"
              : "border-neutral-200 bg-neutral-100"
          }`}
          onPress={() => {
            if (canCancelTransaction) {
              setShowCancellationModal(true);
            } else {
              Alert.alert(
                "Cannot Cancel",
                "Transactions cannot be cancelled within 1 hour of the scheduled meetup time."
              );
            }
          }}
          disabled={!canCancelTransaction}
        >
          <Text
            className={`text-base font-inter-semibold ${
              canCancelTransaction ? "text-error-600" : "text-neutral-400"
            }`}
          >
            Cancel Transaction
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>

      {/* Transaction Cancellation Modal */}
      <TransactionCancellationModal
        visible={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        onConfirm={handleCancelTransaction}
        isLoading={isCancelling}
      />
    </BottomSheetModal>
  );
}
