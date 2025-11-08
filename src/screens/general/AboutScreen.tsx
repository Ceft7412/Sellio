import { View, Text, TouchableOpacity } from "react-native";
import React, { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";

const AboutScreen = ({ navigation }: { navigation: any }) => {
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);
  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row bg-white px-4 mb-4">
        <TouchableOpacity
          onPress={handleGoBack}
          className="mb-8 mt-4 self-start flex-row items-center gap-4"
          activeOpacity={0.7}
        >
          <View className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center">
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </View>
          <Text className="font-inter-bold text-xl text-primary-500">
            About Us
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white mx-4 rounded-md shadow-sm p-4 py-8 gap-2 items-center justify-center mb-4">
        <Text className="font-inter-bold text-2xl">Sellio</Text>
        <Text className="font-inter-regular text-md text-gray-500 italic">
          "Buy, Sell, Bid with Confidence"
        </Text>
        <Text className="text-gray-500 text-center">
          Sellio is a blockchain-powered marketplace where you can buy and sell
          items securely. Our platform combines traditional e-commerce with with
          blockchain integration to ensure transparency, authenticity, and trust
          in every transaction.
        </Text>
      </View>
      <Text className="w-full text-center text-gray-500 font-inter-regular text-sm">
        © 2025 Sellio. All rights reserved.
      </Text>
    </View>
  );
};

export default AboutScreen;
