import { View, Text, Image } from "react-native";
import React from "react";
import { CheckmarkCircleRegularIcon } from "../../icons/outline/check-mark-outline";
import { formatMessageTime, formatSeenAt } from "../../../utils/dateHelpers";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
  readAt: string | null;
  messageType?: string;
  imageUrl?: string;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  chatUser: ChatUser | null;
  currentUserAvatar?: string;
  currentUserName?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
  chatUser,
  currentUserAvatar,
  currentUserName,
}) => {
  console.log(message);
  return (
    <View
      className={`flex-row mb-3 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {!isOwnMessage && (
        <>
          {chatUser?.avatar ? (
            <Image
              source={{ uri: chatUser.avatar }}
              className="w-8 h-8 rounded-full mr-2 self-start"
            />
          ) : (
            <View className="w-8 h-8 rounded-full mr-2 bg-primary-100 items-center justify-center self-start">
              <Text className="text-xs font-inter-medium text-primary-500">
                {chatUser?.name.charAt(0)}
              </Text>
            </View>
          )}
        </>
      )}
      <View
        className={`max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}
      >
        {/* Image message - no background */}
        {message.messageType === "image" && message.imageUrl ? (
          <>
            <Image
              source={{ uri: message.imageUrl }}
              className="w-64 h-64 rounded-2xl"
              resizeMode="cover"
            />
            {/* Timestamp for image */}
            <View className="flex-row items-center mt-1 px-1">
              <Text className="font-inter-regular text-xs text-neutral-500">
                {formatMessageTime(message.timestamp)}
              </Text>
              {isOwnMessage && (
                <View className="ml-1">
                  {message.isRead ? (
                    <CheckmarkCircleRegularIcon size={14} color="#10B981" />
                  ) : (
                    <View className="w-3.5 h-3.5 rounded-full border-2 border-neutral-400" />
                  )}
                </View>
              )}
            </View>
            {/* Seen at for image (only show seen, not sent) */}
            {isOwnMessage && message.readAt && (
              <View className="mt-0.5 px-1">
                <Text className="font-inter-regular text-[10px] text-success-600">
                  {formatSeenAt(message.readAt)}
                </Text>
              </View>
            )}
          </>
        ) : (
          /* Text Message Bubble */
          <>
            <View
              className={`px-4 py-3 rounded-2xl ${
                isOwnMessage
                  ? "bg-primary-500 rounded-tr-sm"
                  : "bg-neutral-100 rounded-tl-sm"
              }`}
            >
              {/* Text content */}
              {message.text && (
                <Text
                  className={`font-inter-regular text-base leading-5 ${
                    isOwnMessage ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {message.text}
                </Text>
              )}
            </View>

            {/* Timestamp and read status */}
            <View className="flex-row items-center mt-1 px-1">
              <Text className="font-inter-regular text-xs text-neutral-500">
                {formatMessageTime(message.timestamp)}
              </Text>
              {isOwnMessage && (
                <View className="ml-1">
                  {message.isRead ? (
                    <CheckmarkCircleRegularIcon size={14} color="#10B981" />
                  ) : (
                    <View className="w-3.5 h-3.5 rounded-full border-2 border-neutral-400" />
                  )}
                </View>
              )}
            </View>

            {/* Seen at info (only show seen, not sent) */}
            {isOwnMessage && message.readAt && (
              <View className="mt-0.5 px-1">
                <Text className="font-inter-regular text-[10px] text-success-600">
                  {formatSeenAt(message.readAt)}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      {isOwnMessage && (
        <>
          {currentUserAvatar ? (
            <Image
              source={{ uri: currentUserAvatar }}
              className="w-8 h-8 rounded-full ml-2 self-start"
            />
          ) : (
            <View className="w-8 h-8 rounded-full ml-2 bg-primary-100 items-center justify-center self-start">
              <Text className="text-xs font-inter-medium text-primary-500">
                {currentUserName?.charAt(0) || "U"}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};
