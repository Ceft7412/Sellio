import { View, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import React, { useState } from "react";
import {
  ChevronLeftRegularIcon,
  ImageRegularIcon,
  SendRegularIcon,
} from "../../icons/outline/chevron-left";
import * as ImagePicker from "expo-image-picker";

interface ChatInputProps {
  messageText: string;
  onChangeText: (text: string) => void;
  onSendMessage: () => void;
  onSendImage: (imageUri: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  messageText,
  onChangeText,
  onSendMessage,
  onSendImage,
  disabled = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSend = () => {
    if (selectedImage) {
      onSendImage(selectedImage);
      setSelectedImage(null);
    } else if (messageText.trim()) {
      onSendMessage();
    }
  };

  return (
    <View className="px-4 py-3 border-t border-neutral-200 bg-white">
      {/* Image preview */}
      {selectedImage && (
        <View className="mb-3 relative">
          <Image
            source={{ uri: selectedImage }}
            className="w-32 h-32 rounded-xl"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neutral-800 items-center justify-center"
          >
            <ChevronLeftRegularIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={pickImage}
          disabled={disabled}
          className="w-10 h-10 items-center justify-center mr-2"
        >
          <ImageRegularIcon size={24} color="#6B7280" />
        </TouchableOpacity>
        <View className="flex-1 bg-neutral-100 rounded-xl px-4 py-0.5 flex-row items-center">
          <TextInput
            value={messageText}
            onChangeText={onChangeText}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 font-inter-regular text-base text-neutral-900"
            multiline
            maxLength={500}
            editable={!disabled}
          />
        </View>
        <TouchableOpacity
          onPress={handleSend}
          disabled={disabled || (!messageText.trim() && !selectedImage)}
          className={`w-10 h-10 items-center justify-center ml-2 rounded-full ${
            messageText.trim() || selectedImage
              ? "bg-primary-500"
              : "bg-neutral-200"
          }`}
        >
          <SendRegularIcon
            size={20}
            color={messageText.trim() || selectedImage ? "#FFFFFF" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
