import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";

interface LocationSharingCardProps {
  // Sharing states
  isSharing: boolean;
  oppositeUserSharing: boolean;

  // Distance states
  myDistance: string | null;
  oppositeUserDistance: string | null;

  // User info
  oppositeUserName: string | undefined;

  // Actions
  onStartSharing: () => void;
  onStopSharing: () => void;

  // Loading states
  isStarting: boolean;
  isStopping: boolean;
}

export default function LocationSharingCard({
  isSharing,
  oppositeUserSharing,
  myDistance,
  oppositeUserDistance,
  oppositeUserName,
  onStartSharing,
  onStopSharing,
  isStarting,
  isStopping,
}: LocationSharingCardProps) {
  const handleShareLocation = () => {
    if (isSharing) {
      onStopSharing();
    } else {
      onStartSharing();
    }
  };

  return (
    <View className="mb-6">
      {/* Location Sharing Status Card */}
      {(isSharing || oppositeUserSharing) && (
        <View className="bg-success-50 rounded-2xl p-4 mb-4 border border-success-200">
          <Text className="text-xs font-inter-medium text-success-700 mb-3">
            Live Location Sharing
          </Text>

          {/* My Location Status */}
          {isSharing && (
            <View className="mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm font-inter-semibold text-neutral-900">
                  You (Sharing)
                </Text>
                <View className="bg-success-500 px-2 py-0.5 rounded-full">
                  <Text className="text-xs font-inter-semibold text-white">
                    Active
                  </Text>
                </View>
              </View>
              {myDistance && (
                <Text className="text-base font-inter-bold text-success-600">
                  {myDistance} away from meetup
                </Text>
              )}
            </View>
          )}

          {/* Opposite User Location Status */}
          {oppositeUserSharing && (
            <View>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm font-inter-semibold text-neutral-900">
                  {oppositeUserName} (Sharing)
                </Text>
                <View className="bg-success-500 px-2 py-0.5 rounded-full">
                  <Text className="text-xs font-inter-semibold text-white">
                    Active
                  </Text>
                </View>
              </View>
              {oppositeUserDistance && (
                <Text className="text-base font-inter-bold text-success-600">
                  {oppositeUserDistance} away from meetup
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Share Location Button */}
      <TouchableOpacity
        className={`py-4 px-4 rounded-xl items-center mb-3 ${
          isSharing ? "bg-error-500" : "bg-primary-500"
        }`}
        onPress={handleShareLocation}
        disabled={isStarting || isStopping}
      >
        {isStarting || isStopping ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-base font-inter-semibold text-white">
            {isSharing ? "Stop Sharing Location" : "Share Live Location (1hr)"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
