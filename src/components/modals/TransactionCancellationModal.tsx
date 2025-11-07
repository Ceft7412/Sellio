import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { CloseOutlineIcon } from "../icons/outline/close-outline";

interface TransactionCancellationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string, customReason?: string) => void;
  isLoading?: boolean;
}

const CANCELLATION_REASONS = [
  { id: "scheduling_conflicts", label: "Scheduling conflicts" },
  { id: "price_concerns", label: "Price concerns" },
  { id: "item_condition_concerns", label: "Item condition concerns" },
  { id: "safety_concerns", label: "Safety concerns" },
  { id: "other", label: "Other (specify reason)" },
];

export default function TransactionCancellationModal({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}: TransactionCancellationModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");

  const handleConfirm = () => {
    if (!selectedReason) return;

    if (selectedReason === "other" && !customReason.trim()) {
      return;
    }

    onConfirm(
      selectedReason,
      selectedReason === "other" ? customReason : undefined
    );

    // Reset state
    setSelectedReason(null);
    setCustomReason("");
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedReason(null);
      setCustomReason("");
      onClose();
    }
  };

  const isConfirmDisabled =
    !selectedReason ||
    (selectedReason === "other" && !customReason.trim()) ||
    isLoading;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent>
      <Pressable
        onPress={handleClose}
        className="flex-1 items-center justify-center bg-black/50"
        disabled={isLoading}
      >
        <View
          className="bg-white rounded-2xl w-[90%] max-w-md"
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
            <Text className="text-xl font-inter-bold text-neutral-900">
              Cancel Transaction
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              className="w-8 h-8 items-center justify-center"
            >
              <CloseOutlineIcon size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="px-6 pb-6">
            <Text className="text-base font-inter-regular text-neutral-600 mb-4">
              Please select a reason for cancelling this transaction:
            </Text>

            {/* Reason options */}
            <View className="gap-3">
              {CANCELLATION_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  onPress={() => setSelectedReason(reason.id)}
                  disabled={isLoading}
                  className={`flex-row items-center p-4 rounded-xl border ${
                    selectedReason === reason.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full border items-center justify-center mr-3 ${
                      selectedReason === reason.id
                        ? "border-primary-500"
                        : "border-neutral-300"
                    }`}
                  >
                    {selectedReason === reason.id && (
                      <View className="w-3 h-3 rounded-full bg-primary-500" />
                    )}
                  </View>
                  <Text
                    className={`text-base font-inter-medium ${
                      selectedReason === reason.id
                        ? "text-primary-700"
                        : "text-neutral-700"
                    }`}
                  >
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom reason input */}
            {selectedReason === "other" && (
              <View className="mt-4">
                <TextInput
                  placeholder="Please specify your reason..."
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                  numberOfLines={4}
                  editable={!isLoading}
                  className="border border-neutral-200 rounded-xl p-4 text-base font-inter-regular text-neutral-900 min-h-[100px]"
                  style={{ textAlignVertical: "top" }}
                  maxLength={500}
                />
                <Text className="text-xs font-inter-regular text-neutral-500 mt-1 text-right">
                  {customReason.length}/500
                </Text>
              </View>
            )}

            {/* Action buttons */}
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={handleClose}
                disabled={isLoading}
                className="flex-1 py-4 px-4 rounded-xl border border-neutral-300 bg-white items-center"
              >
                <Text className="text-base font-inter-semibold text-neutral-700">
                  Keep
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={isConfirmDisabled}
                className={`flex-1 py-4 px-4 rounded-xl items-center justify-center ${
                  isConfirmDisabled ? "bg-error-300" : "bg-error-500"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-base font-inter-semibold text-white">
                    Confirm
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
