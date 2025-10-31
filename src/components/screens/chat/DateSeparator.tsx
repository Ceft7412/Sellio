import { View, Text } from "react-native";
import React from "react";
import { formatMessageDate } from "../../../utils/dateHelpers";

interface DateSeparatorProps {
  date: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  return (
    <View className="items-center mb-4">
      <View className="bg-neutral-100 px-3 py-1.5 rounded-full">
        <Text className="font-inter-medium text-xs text-neutral-600">
          {formatMessageDate(date)}
        </Text>
      </View>
    </View>
  );
};
