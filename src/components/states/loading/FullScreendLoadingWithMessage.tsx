import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import React from "react";

const FullScreendLoadingWithMessage = ({ message }: { message: string }) => {
  return (
    <Modal visible={true} transparent={true}>
      <View className="flex-1 items-center justify-center bg-black/20">
        <View className="bg-white p-4 px-6 rounded-lg items-center justify-center w-[70%]">
          <ActivityIndicator size="large" color={"#0D3F81"} />
          <Text className="text-lg font-inter-medium text-neutral-600 mt-4 text-center">
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default FullScreendLoadingWithMessage;

const styles = StyleSheet.create({});
