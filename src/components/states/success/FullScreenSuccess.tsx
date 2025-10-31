import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

const FullScreenSuccess = ({
  visible,
  title,
  message,
  icon,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  icon: React.ReactNode;
  onConfirm: () => void;
}) => {
  return (
    <Modal visible={visible} transparent={true}>
      <View className="flex-1 bg-white items-center justify-between w-full h-full p-6 py-20">
        <View className="items-center justify-center">
          {icon}
          <Text className="text-2xl font-inter-bold text-neutral-900 mt-4 text-center">
            {title}
          </Text>
          <Text className="text-lg font-inter-medium text-neutral-600 mt-4 text-center">
            {message}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onConfirm}
          className="bg-primary-500 px-4 py-4 rounded-lg w-full items-center justify-center "
        >
          <Text className="text-white text-base font-inter-semiBold">OK</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default FullScreenSuccess;

const styles = StyleSheet.create({});
