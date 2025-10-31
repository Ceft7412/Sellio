import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeftRegularIcon } from "../../components/icons/outline/chevron-left";
import { useConversation } from "../../hooks/useMessages";
import TransactionDetailsBottomSheet from "../../components/bottomsheets/TransactionDetailsBottomSheet";

export default function MapMarkedLocation({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { conversationId } = route?.params || {};
  const mapRef = useRef<MapView>(null);

  // Fetch conversation data to get transaction and product details
  const {
    data: conversationData,
    isLoading,
    error,
  } = useConversation(conversationId);

  const [bottomSheetVisible, setBottomSheetVisible] = useState(true);

  const handleBack = () => {
    navigation.goBack();
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D3F81" />
        </View>
      </SafeAreaView>
    );
  }

  // Error or no data
  if (error || !conversationData?.transaction) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-inter-bold text-neutral-900 mb-2">
            Transaction Not Found
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="px-6 py-3 rounded-xl bg-primary-500 mt-4"
          >
            <Text className="text-base font-inter-semibold text-white">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { transaction, product, oppositeUser, offer } = conversationData;
  const coordinates = transaction.meetupCoordinates;

  // Default to coordinates if available, otherwise default location
  const initialRegion = coordinates
    ? {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 7.0716,
        longitude: 125.6128,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  return (
    <View className="flex-1">
      {/* Full-screen Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {coordinates && (
          <Marker
            coordinate={{
              latitude: coordinates.lat,
              longitude: coordinates.lng,
            }}
            title="Meetup Location"
            description={transaction.meetupLocation || ""}
          />
        )}
      </MapView>

      {/* Close Button (Top Left) */}
      <SafeAreaView className="absolute top-0 left-0 right-0">
        <TouchableOpacity
          onPress={handleBack}
          className="ml-4 mt-2 w-10 h-10 rounded-full bg-white items-center justify-center shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <ChevronLeftRegularIcon size={24} color="#1F2937" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Transaction Details Bottom Sheet */}
      <TransactionDetailsBottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        transaction={transaction}
        product={product}
        oppositeUser={oppositeUser}
        offer={offer || null}
      />
    </View>
  );
}
