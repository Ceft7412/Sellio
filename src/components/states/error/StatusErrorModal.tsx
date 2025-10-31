import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

const StatusErrorModal = ({
  visible,
  message,
  title,
  onConfirm,
}: {
  visible: boolean;
  message: string;
  title: string;
  onConfirm: () => void;
}) => {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent={true}>
      <Pressable
        onPress={onConfirm}
        className="flex-1 items-center justify-center bg-black/20"
      >
        <View
          className="bg-white py-6 px-6 rounded-lg items-center justify-center w-[80%]"
          onStartShouldSetResponder={() => true}
        >
          <Text className="text-2xl font-inter-bold text-neutral-900 mb-2 text-center">
            {title}
          </Text>
          <Text className="text-lg font-inter-medium text-neutral-600 mt-4 text-center mb-4">
            {message}
          </Text>
          <TouchableOpacity
            onPress={onConfirm}
            className="bg-primary-500 p-4 rounded-lg items-center justify-center w-[80%]"
          >
            <Text className="text-white text-base font-inter-semiBold">OK</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default StatusErrorModal;

const styles = StyleSheet.create({});
