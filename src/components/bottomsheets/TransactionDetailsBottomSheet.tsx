import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useMemo, useRef, useEffect } from "react";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useAuthStore } from "../../store/authStore";

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

interface TransactionDetailsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  transaction: TransactionDetails;
  product: Product | null;
  oppositeUser: OppositeUser | null;
  offer: Offer | null;
}

export default function TransactionDetailsBottomSheet({
  visible,
  onClose,
  transaction,
  product,
  oppositeUser,
  offer,
}: TransactionDetailsBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { user } = useAuthStore();

  // Snap points - leave space for the close button on map
  const snapPoints = useMemo(() => ["65%"], []);

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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing={false}
      snapPoints={["45%", "65%", "85%"]}
      enablePanDownToClose={false}
      handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }}
    >
      <BottomSheetScrollView
        className=" px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}

        <View className="mb-4">
          <Text className="text-xl font-inter-bold text-neutral-900">
            Transaction Details
          </Text>
        </View>

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

        {/* Action Buttons */}
        <View className="mb-6">
          <TouchableOpacity
            className="py-4 px-4 rounded-xl bg-primary-500 items-center mb-3"
            onPress={() => {
              // TODO: Implement Share Live Location
              console.log("Share Live Location");
            }}
          >
            <Text className="text-base font-inter-semibold text-white">
              Share Live Location (1hr)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 px-4 rounded-xl border border-error-300 bg-white items-center"
            onPress={() => {
              // TODO: Implement Cancel Transaction
              console.log("Cancel Transaction");
            }}
          >
            <Text className="text-base font-inter-semibold text-error-600">
              Cancel Transaction
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
