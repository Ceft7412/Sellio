import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

const ConfirmationModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent={true}>
      <Pressable
        onPress={onCancel}
        className="flex-1 items-center justify-center bg-black/20"
      >
        <View
          className="bg-white py-6 px-6 rounded-lg items-center justify-center w-[80%]"
          onStartShouldSetResponder={() => true}
        >
          <Text className="text-xl font-inter-bold text-neutral-900 mb-2 text-center">
            {title}
          </Text>
          <Text className="text-lg font-inter-medium text-neutral-600 mt-4 text-center mb-4">
            {message}
          </Text>

          {/* Buttons container */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-4 rounded-xl bg-neutral-300"
            >
              <Text className="text-center text-neutral-700 text-base font-inter-semiBold">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 py-4 rounded-xl bg-primary-500"
            >
              <Text className="text-center text-white text-base font-inter-semiBold">
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({});
