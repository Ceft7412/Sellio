import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsAPI } from "../../../../constants/axios";
import { DateTimePickerModal } from "../DateTimePickerModal";
import { SelectLocationBottomSheet } from "../SelectLocationBottomSheet";

interface TransactionDetails {
  id: string;
  status: string;
  meetupStatus: string;
  scheduledMeetupAt: string | null;
  meetupLocation: string | null;
  meetupCoordinates: any;
  meetupProposedBy: string | null;
  agreedPrice: string;
  buyerId: string;
  sellerId: string;
}

interface MeetupActionsProps {
  transaction: TransactionDetails;
  currentUserId: string;
  conversationId: string;
  buyerId: string;
  sellerId: string;
  onViewDetails?: () => void;
}

export const MeetupActions: React.FC<MeetupActionsProps> = ({
  transaction,
  currentUserId,
  conversationId,
  buyerId,
  sellerId,
  onViewDetails,
}) => {
  const queryClient = useQueryClient();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);

  // Propose meetup mutation
  const proposeMutation = useMutation({
    mutationFn: (data: {
      scheduledMeetupAt: string;
      meetupLocation: string;
      meetupCoordinates: any;
    }) => transactionsAPI.proposeMeetup(transaction.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      Alert.alert("Success", "Meetup proposal sent successfully");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to propose meetup"
      );
    },
  });

  // Accept meetup mutation
  const acceptMutation = useMutation({
    mutationFn: () => transactionsAPI.acceptMeetup(transaction.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      Alert.alert("Success", "Meetup accepted successfully");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to accept meetup"
      );
    },
  });

  const handleDateTimeConfirm = (date: Date) => {
    setSelectedDateTime(date);
    setShowDatePicker(false);
    // After date/time selection, show location picker
    setTimeout(() => setShowLocationPicker(true), 300);
  };

  const handleLocationConfirm = (location: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    if (!selectedDateTime) return;

    proposeMutation.mutate({
      scheduledMeetupAt: selectedDateTime.toISOString(),
      meetupLocation: location.address,
      meetupCoordinates: {
        lat: location.lat,
        lng: location.lng,
        address: location.address,
      },
    });

    setSelectedDateTime(null);
  };

  const handleSetTimeLocation = () => {
    setShowDatePicker(true);
  };

  const handleAcceptMeetup = () => {
    Alert.alert(
      "Accept Meetup",
      `Accept the meetup proposal?\n\nDate: ${formatDate(
        transaction.scheduledMeetupAt!
      )}\nTime: ${formatTime(transaction.scheduledMeetupAt!)}\nLocation: ${
        transaction.meetupLocation
      }`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Accept", onPress: () => acceptMutation.mutate() },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Don't show if transaction is not active
  if (transaction.status !== "active") {
    return null;
  }

  // Show "Set Time & Location" if no meetup scheduled yet
  if (transaction.meetupStatus === "not_scheduled") {
    return (
      <>
        <View className="px-4 py-3 bg-success-50 border-t border-success-200">
          <Text className="text-sm font-inter-medium text-success-700 mb-3">
            Offer Accepted! Set up your meetup
          </Text>
          <TouchableOpacity
            onPress={handleSetTimeLocation}
            disabled={proposeMutation.isPending}
            className="py-3 px-4 rounded-xl bg-success-500 items-center"
          >
            {proposeMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-inter-semibold text-white">
                Set Time & Location
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onConfirm={handleDateTimeConfirm}
        />

        <SelectLocationBottomSheet
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onConfirm={handleLocationConfirm}
        />
      </>
    );
  }

  // Show meetup details and action buttons when scheduled
  if (
    transaction.meetupStatus === "scheduled" &&
    transaction.scheduledMeetupAt
  ) {
    // Check if current user is the one who proposed
    // If meetupProposedBy is null, show both buttons (backward compatibility)
    const isProposer = transaction.meetupProposedBy
      ? transaction.meetupProposedBy === currentUserId
      : false;

    console.log("MeetupActions Debug:", {
      meetupProposedBy: transaction.meetupProposedBy,
      currentUserId: currentUserId,
      isProposer: isProposer,
      meetupStatus: transaction.meetupStatus,
    });

    return (
      <>
        <View className="px-4 py-3 bg-info-50 ">
          <Text className="text-sm font-inter-medium text-info-700 mb-2">
            Proposed Meetup
          </Text>
          <View className="bg-primary-50 rounded-xl p-3 mb-3">
            <Text className="text-sm font-inter-regular text-neutral-700">
              {formatDate(transaction.scheduledMeetupAt)}
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-700 mt-1">
              {formatTime(transaction.scheduledMeetupAt)}
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-700 mt-1">
              {transaction.meetupLocation}
            </Text>
          </View>

          {isProposer ? (
            // If user is proposer, only show Update button
            <TouchableOpacity
              onPress={handleSetTimeLocation}
              disabled={proposeMutation.isPending}
              className="py-3 px-4 rounded-xl bg-info-500 items-center"
            >
              {proposeMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-base font-inter-semibold text-white">
                  Update Time & Location
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            // If user is not proposer, show Update and Accept buttons
            <View className="flex-row" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={handleSetTimeLocation}
                disabled={proposeMutation.isPending || acceptMutation.isPending}
                className="flex-1 py-3 px-4 rounded-xl bg-neutral-100 items-center"
              >
                {proposeMutation.isPending ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <Text className="text-base font-inter-semibold text-neutral-900">
                    Update
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAcceptMeetup}
                disabled={acceptMutation.isPending || proposeMutation.isPending}
                className="flex-1 py-3 px-4 bg-primary-500 rounded-xl items-center"
              >
                {acceptMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-base font-inter-semibold text-white">
                    Accept
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <DateTimePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onConfirm={handleDateTimeConfirm}
        />

        <SelectLocationBottomSheet
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onConfirm={handleLocationConfirm}
        />
      </>
    );
  }

  // Show View Details button when meetup is confirmed
  if (transaction.meetupStatus === "confirmed") {
    return (
      <View className="px-4 py-3 bg-primary-50 border-t border-primary-200">
        <TouchableOpacity
          onPress={onViewDetails}
          className="py-3 px-4 rounded-xl bg-primary-500 items-center"
        >
          <Text className="text-base font-inter-semibold text-white">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};
