import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  useConversation,
  useMarkMessagesAsRead,
  useMessages,
  useSendMessage,
} from "../../hooks/useMessages";
import { useAuthStore } from "../../store/authStore";
import { useSocket } from "../../providers/SocketProvider";
import { messagesAPI, transactionsAPI } from "../../constants/axios";
import { ChatHeader } from "../../components/screens/chat/ChatHeader";
import { ChatMessage } from "../../components/screens/chat/ChatMessage";
import { ChatInput } from "../../components/screens/chat/ChatInput";
import { DateSeparator } from "../../components/screens/chat/DateSeparator";
import { isSameDay } from "../../utils/dateHelpers";
import { ChatOptionsBottomSheet } from "../../components/bottomsheets/ChatOptionsBottomSheet";
import { useFocusEffect } from "@react-navigation/native";
import { TransactionCompletionModal } from "../../components/modals/TransactionCompletionModal";

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

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

export default function ChatScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  // Get conversationId from route params
  const conversationId = route?.params?.conversationId;

  // Get current user
  const { user } = useAuthStore();
  const currentUserId = user?.id || "";

  // Socket for real-time updates
  const socket = useSocket();

  // Bottom sheet ref for chat options
  const chatOptionsBottomSheetRef = useRef<BottomSheetModal>(null);

  // State to track if user has already reviewed
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingReviewStatus, setCheckingReviewStatus] = useState(true);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const scrollViewRef = useRef<ScrollView>(null);
  // Fetch conversation data
  const {
    data: conversationData,
    isLoading: loadingConversation,
    error: conversationError,
    refetch: refetchConversation,
  } = useConversation(conversationId);

  // Fetch messages for this conversation
  const {
    data: messagesData,
    isLoading: loadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useMessages(conversationId);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messagesData]);

  // Mark messages as read mutation
  const markAsReadMutation = useMarkMessagesAsRead();

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversationId && conversationData) {
      markAsReadMutation.mutate(conversationId);
    }
  }, [conversationId, conversationData?.id]);

  // Check if user has already reviewed this transaction
  // Use useFocusEffect to re-check whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const checkReview = async () => {
        const transaction = conversationData?.transaction;
        if (transaction && transaction.status === "completed") {
          setCheckingReviewStatus(true);
          try {
            const response = await transactionsAPI.checkReviewExists(
              transaction.id
            );
            setHasReviewed(response.data.hasReviewed);
          } catch (error) {
          } finally {
            setCheckingReviewStatus(false);
          }
        } else {
          // If transaction is not completed, no need to check
          setCheckingReviewStatus(false);
        }
      };

      checkReview();
    }, [
      conversationData?.transaction?.id,
      conversationData?.transaction?.status,
    ])
  );

  // Real-time message updates via socket
  useEffect(() => {
    if (!socket || !conversationId) return;
    const handleNewMessage = (data: any) => {
      if (data.conversationId === conversationId) {
        refetchMessages();
        // Mark as read immediately
        markAsReadMutation.mutate(conversationId);
      }
    };

    const handleMessagesRead = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch messages to update read status in real-time
        refetchMessages();
      }
    };

    const handleOfferUpdated = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when offer is updated
        refetchConversation();
        refetchMessages();
      }
    };

    const handleOfferAccepted = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when offer is accepted
        refetchConversation();
        refetchMessages();
      }
    };

    const handleOfferRejected = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when offer is rejected
        refetchConversation();
        refetchMessages();
      }
    };

    const handleBuyConfirmed = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when buy is confirmed
        refetchConversation();
        refetchMessages();
      }
    };

    const handleMeetupProposed = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when meetup is proposed
        refetchConversation();
        refetchMessages();
      }
    };

    const handleMeetupAccepted = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when meetup is accepted
        refetchConversation();
        refetchMessages();
      }
    };

    const handleTransactionCompleted = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when transaction is completed
        refetchConversation();
        refetchMessages();
        if (data.completionData) {
          setCompletionData(data.completionData);
          setCompletionModalVisible(true);
        }
      }
    };

    const handleTransactionCancelled = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when transaction is cancelled
        refetchConversation();
        refetchMessages();
      }
    };

    const handleTransactionExpired = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when transaction is expired
        refetchConversation();
        refetchMessages();
      }
    };

    const handleBidWon = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when bid is won
        refetchConversation();
        refetchMessages();
      }
    };

    const handleBiddingEnded = (data: any) => {
      if (data.conversationId === conversationId) {
        // Refetch conversation and messages when bidding ends
        refetchConversation();
        refetchMessages();
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);
    socket.on("offer_updated", handleOfferUpdated);
    socket.on("offer_accepted", handleOfferAccepted);
    socket.on("offer_rejected", handleOfferRejected);
    socket.on("buy_confirmed", handleBuyConfirmed);
    socket.on("meetup_proposed", handleMeetupProposed);
    socket.on("meetup_accepted", handleMeetupAccepted);
    socket.on("transaction_completed", handleTransactionCompleted);
    socket.on("transaction_cancelled", handleTransactionCancelled);
    socket.on("transaction_expired", handleTransactionExpired);
    socket.on("bid_won", handleBidWon);
    socket.on("bidding_ended", handleBiddingEnded);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
      socket.off("offer_updated", handleOfferUpdated);
      socket.off("offer_accepted", handleOfferAccepted);
      socket.off("offer_rejected", handleOfferRejected);
      socket.off("buy_confirmed", handleBuyConfirmed);
      socket.off("meetup_proposed", handleMeetupProposed);
      socket.off("meetup_accepted", handleMeetupAccepted);
      socket.off("transaction_completed", handleTransactionCompleted);
      socket.off("transaction_cancelled", handleTransactionCancelled);
      socket.off("transaction_expired", handleTransactionExpired);
      socket.off("bid_won", handleBidWon);
      socket.off("bidding_ended", handleBiddingEnded);
    };
  }, [socket, conversationId]);

  // Transform conversation data to UI format
  const chatUser: ChatUser | null = conversationData?.oppositeUser
    ? {
        id: conversationData.oppositeUser.id,
        name: conversationData.oppositeUser.displayName,
        avatar: conversationData.oppositeUser.avatarUrl || "",
        verified: conversationData.oppositeUser.identityVerified,
      }
    : null;

  const product: Product | null = conversationData?.product
    ? {
        id: conversationData.product.id,
        title: conversationData.product.title,
        price: parseFloat(conversationData.product.price || "0"),
        image:
          conversationData.product.imageUrl ||
          "https://via.placeholder.com/100",
      }
    : null;

  // Get offer details if conversation has an offer
  const offerDetails = conversationData?.offer || null;

  // Get buy details if conversation has a buy
  const buyDetails = conversationData?.buy || null;

  // Get bid details if conversation has a bid
  const bidDetails = conversationData?.bid || null;

  // Transform messages data to UI format
  const messages: Message[] =
    messagesData?.map((msg) => ({
      id: msg.id,
      text: msg.content,
      senderId: msg.senderId,
      timestamp: msg.createdAt,
      isRead: msg.isRead,
      readAt: msg.readAt,
      messageType: msg.messageType,
      imageUrl: msg.imageUrl || undefined,
    })) || [];

  const [messageText, setMessageText] = useState("");

  const handleBack = () => {
    navigation.goBack();
  };

  const handleViewTransactionDetails = () => {
    navigation.navigate("general", {
      screen: "mapMarkedLocation",
      params: { conversationId },
    } as never);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: messageText.trim(),
        messageType: "text",
      });
      setMessageText("");
    } catch (error) {}
  };

  const handleSendImage = async (imageUri: string) => {
    if (!conversationId) return;

    try {
      // Upload image to GCS first
      const uploadResponse = await messagesAPI.uploadChatImage(imageUri);
      const imageUrl = uploadResponse.data.imageUrl;

      // Send message with GCS image URL (no text content for image messages)
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: "",
        messageType: "image",
        imageUrl: imageUrl,
      });
    } catch (error) {}
  };

  const handleProductPress = () => {
    navigation.navigate("general", {
      screen: "productDetail",
      params: { productId: product?.id },
    } as never);
  };

  const handleOpenOptions = () => {
    chatOptionsBottomSheetRef.current?.present();
  };

  const handleReportUser = () => {
    // Close bottom sheet
    chatOptionsBottomSheetRef.current?.dismiss();

    // Get the reported user (the opposite user in the conversation)
    const reportedUser = conversationData?.oppositeUser;
    const transaction = conversationData?.transaction;

    if (!reportedUser || !transaction || !product) return;

    // Determine if current user is buyer or seller
    const isBuyer = transaction.buyerId === currentUserId;

    // Navigate to report screen
    navigation.navigate("general", {
      screen: "reportUser",
      params: {
        reportedUserId: reportedUser.id,
        reportedUserName: reportedUser.displayName,
        productId: product.id,
        transactionId: transaction.id,
        conversationId: conversationId,
        userRole: isBuyer ? "buyer" : "seller",
      },
    } as never);
  };

  // Check if user can report (transaction must be completed, cancelled, or expired)
  const canReport = conversationData?.transaction
    ? [
        "completed",
        "cancelled_by_buyer",
        "cancelled_by_seller",
        "expired",
      ].includes(conversationData.transaction.status)
    : false;

  const handleReview = () => {
    const transaction = conversationData?.transaction;
    const oppositeUser = conversationData?.oppositeUser;
    const productData = conversationData?.product;

    if (!transaction || !oppositeUser) return;

    // Navigate to review screen
    navigation.navigate("general", {
      screen: "review",
      params: {
        transactionId: transaction.id,
        revieweeName: oppositeUser.displayName,
        revieweeAvatar: oppositeUser.avatarUrl,
        productTitle: productData?.title,
      },
    } as never);
  };

  const handleViewProfile = () => {
    const oppositeUser = conversationData?.oppositeUser;

    if (!oppositeUser) return;

    // Navigate to user profile screen
    navigation.navigate("general", {
      screen: "userProfile",
      params: {
        userId: oppositeUser.id,
      },
    } as never);
  };

  // Render messages with date separators
  const renderMessagesWithDates = () => {
    const elements: React.ReactElement[] = [];
    let lastDate: string | null = null;

    messages.forEach((message) => {
      // Add date separator if date changed
      if (!lastDate || !isSameDay(lastDate, message.timestamp)) {
        elements.push(
          <DateSeparator
            key={`date-${message.timestamp}`}
            date={message.timestamp}
          />
        );
        lastDate = message.timestamp;
      }

      // Add message
      elements.push(
        <ChatMessage
          key={message.id}
          message={message}
          isOwnMessage={message.senderId === currentUserId}
          chatUser={chatUser}
          currentUserAvatar={user?.avatarUrl || undefined}
          currentUserName={user?.displayName || undefined}
        />
      );
    });

    return elements;
  };

  // Loading state
  if (loadingConversation || loadingMessages) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D3F81" />
          <Text className="text-base font-inter-medium text-neutral-600 mt-4">
            Loading conversation...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error or no data
  if (conversationError || messagesError || !chatUser) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-inter-bold text-neutral-900 mb-2">
            Conversation Not Found
          </Text>
          <Text className="text-base font-inter-regular text-neutral-600 text-center mb-6">
            Unable to load conversation
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="px-6 py-3 rounded-xl bg-primary-500"
          >
            <Text className="text-base font-inter-semiBold text-white">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={60}
      >
        {/* Header with optional offer, buy, bid, and transaction details */}
        <ChatHeader
          chatUser={chatUser}
          offer={offerDetails}
          buy={buyDetails}
          bid={bidDetails}
          transaction={conversationData?.transaction || null}
          currentUserId={user?.id || ""}
          conversationId={conversationId || ""}
          onBack={handleBack}
          onViewTransactionDetails={handleViewTransactionDetails}
          onOpenOptions={handleOpenOptions}
          onReview={handleReview}
          hasReviewed={hasReviewed}
          checkingReviewStatus={checkingReviewStatus}
          onViewProfile={handleViewProfile}
          onTransactionComplete={(data) => {
            setCompletionData(data);
            setCompletionModalVisible(true);
          }}
        />

        {/* Product Context Card - Only show if product exists */}
        {product && (
          <TouchableOpacity
            onPress={handleProductPress}
            className="mx-4 mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-2xl flex-row items-center"
          >
            <Image
              source={{ uri: product.image }}
              className="w-12 h-12 rounded-xl mr-3"
            />
            <View className="flex-1">
              <Text
                className="font-inter-semiBold text-sm text-neutral-900 mb-1"
                numberOfLines={1}
              >
                {product.title}
              </Text>
              <Text className="font-inter-bold text-base text-primary-500">
                ₱{product.price.toLocaleString()}
              </Text>
            </View>
            <View className="px-3 py-1.5 bg-primary-500 rounded-lg">
              <Text className="font-inter-semiBold text-xs text-white">
                View
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 16,
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
          keyboardShouldPersistTaps="handled"
        >
          {renderMessagesWithDates()}
        </ScrollView>

        {/* Input Area */}
        <ChatInput
          messageText={messageText}
          onChangeText={setMessageText}
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          disabled={sendMessageMutation.isPending}
        />

        {/* Chat Options Bottom Sheet */}
        <ChatOptionsBottomSheet
          ref={chatOptionsBottomSheetRef}
          onReportUser={handleReportUser}
          canReport={canReport}
        />

        <TransactionCompletionModal
          isVisible={completionModalVisible}
          onClose={() => setCompletionModalVisible(false)}
          completionData={completionData}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
