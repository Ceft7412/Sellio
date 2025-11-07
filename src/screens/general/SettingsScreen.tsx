import {
  View,
  Text,
  Pressable,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import React, { useCallback } from "react";
import { ShieldRegularIcon } from "../../components/icons/outline/shield-outline";
import { ChatBubblesQuestionRegularIcon } from "../../components/icons/outline/question-outline";
import { InfoRegularIcon } from "../../components/icons/outline/info-outline";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRightRegularIcon } from "../../components/icons/outline/chevron-outline";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";

const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const settingsItems = [
    {
      id: "privacy",
      title: "Privacy & Security",
      icon: <ShieldRegularIcon size={28} />,
      onPress: () => {
        navigation.navigate("general", { screen: "privacyPolicy" });
      },
    },
    {
      id: "help",
      title: "Help & Support",
      icon: <ChatBubblesQuestionRegularIcon size={28} />,
      onPress: () => {
        navigation.navigate("general", { screen: "help" });
      },
    },
    {
      id: "about",
      title: "About",
      icon: <InfoRegularIcon size={28} />,
      onPress: () => {
        navigation.navigate("general", { screen: "about" });
      },
    },
  ];

  const renderItem = (item: any, index: number) => {
    return (
      <Pressable
        key={item.id}
        className=" w-full flex-row justify-between py-4"
        onPress={item.onPress}
      >
        <View className="flex-row items-center gap-2">
          {item.icon}
          <Text className="text-lg font-inter-regular">{item.title}</Text>
        </View>
        <ChevronRightRegularIcon />
      </Pressable>
    );
  };

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4">
      <StatusBar barStyle={"dark-content"} />
      <TouchableOpacity
        onPress={handleGoBack}
        className="mb-8 mt-4 self-start flex-row gap-4 items-center"
        activeOpacity={0.7}
      >
        <View className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center">
          <ArrowLeftOutlineIcon size={20} color="#374151" />
        </View>
        <Text className="font-inter-bold text-xl">Settings</Text>
      </TouchableOpacity>
      <View className="w-full gap-3 bg-white rounded-md p-4 shadow-sm">
        {settingsItems.map((item, index) => renderItem(item, index))}
      </View>
      <Text className="w-full text-center mt-12 text-gray-500">
        Version 1.0.0
      </Text>
    </SafeAreaView>
  );
};

export default SettingsScreen;
