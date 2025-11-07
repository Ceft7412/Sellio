import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Modal,
  Pressable,
} from "react-native";
import { format } from "date-fns";

interface CompletionData {
  buyerName: string;
  sellerName: string;
  productName: string;
  meetupLocation: string;
  completedAt: string;
  referenceNumber: string;
  blockchainTxHash: string;
  totalPrice: string;
}

interface TransactionCompletionModalProps {
  isVisible: boolean;
  onClose: () => void;
  completionData: CompletionData | null;
}

export const TransactionCompletionModal: React.FC<
  TransactionCompletionModalProps
> = ({ isVisible, onClose, completionData }) => {
  if (!completionData) return null;

  return (
    <Modal visible={isVisible} transparent>
      <Pressable
        className="bg-black/[0.3]  flex-1 items-center justify-center "
        onPress={onClose}
      >
        <View
          className="bg-white p-6 rounded-2xl w-[90%]"
          onStartShouldSetResponder={() => true}
        >
          <Text className="text-xl font-inter-bold text-center text-primary-600 mb-12">
            Transaction Details
          </Text>
          <View className="gap-5">
            <View className="flex-row justify-between">
              <Text className="text-base font-inter-medium text-neutral-500">
                Reference #:
              </Text>
              <Text
                className="text-base font-inter-semiBold text-neutral-900"
                selectable
              >
                {completionData.referenceNumber}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-base font-inter-medium text-neutral-500">
                Product:
              </Text>
              <Text className="text-base font-inter-regular text-neutral-900">
                {completionData.productName}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-base font-inter-medium text-neutral-500">
                Buyer:
              </Text>
              <Text className="text-base font-inter-regular text-neutral-900">
                {completionData.buyerName}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-base font-inter-medium text-neutral-500">
                Seller:
              </Text>
              <Text className="text-base font-inter-regular text-neutral-900">
                {completionData.sellerName}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-base font-inter-medium text-neutral-500">
                Completed At:
              </Text>
              <Text className="text-base font-inter-regular text-neutral-900">
                {format(
                  new Date(completionData.completedAt),
                  "MMM dd, yyyy, hh:mm a"
                )}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-basefont-inter-medium text-neutral-500">
                Total Price:
              </Text>
              <Text className="text-base font-inter-bold text-primary-600">
                ₱{parseFloat(completionData.totalPrice).toLocaleString()}
              </Text>
            </View>

            {completionData.blockchainTxHash && (
              <View className="pt-2">
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `https://sepolia.etherscan.io/tx/${completionData.blockchainTxHash}`
                    )
                  }
                  className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex-row items-center"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-xs font-inter-medium text-blue-700 mb-0.5">
                      View on Etherscan
                    </Text>
                    <Text
                      className="text-xs font-inter-regular text-blue-600"
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {completionData.blockchainTxHash}
                    </Text>
                  </View>
                  <Text className="text-blue-500 text-base font-inter-semiBold">
                    ↗
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="mt-6 bg-primary-500 py-3 rounded-xl"
          >
            <Text className="text-white text-center font-inter-semiBold text-base">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};
