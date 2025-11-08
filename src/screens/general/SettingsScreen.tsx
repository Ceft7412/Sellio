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
    <View className="flex-1 bg-gray-50 ">
      <View className="flex-row items-center py-4 px-4 gap-4 mb-4 bg-white">
        <TouchableOpacity
          onPress={handleGoBack}
          className="self-start flex-row gap-4 items-center"
          activeOpacity={0.7}
        >
          <View className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center">
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </View>
        </TouchableOpacity>
        <Text className="font-inter-bold text-xl text-primary-500">
          Settings
        </Text>
      </View>

      <View className=" gap-3 bg-white rounded-md p-4 shadow-sm mx-4">
        {settingsItems.map((item, index) => renderItem(item, index))}
      </View>
    </View>
  );
};

export default SettingsScreen;
