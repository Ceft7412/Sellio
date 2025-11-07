import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState, useRef, useMemo, useEffect } from "react";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeftRegularIcon } from "../../components/icons/outline/chevron-left";
import { LocationRippleColorIcon } from "../../components/icons/fill/location-mark-fill";
import { useConversation } from "../../hooks/useMessages";
import TransactionDetailsBottomSheet from "../../components/bottomsheets/TransactionDetailsBottomSheet";
import { useAuthStore } from "../../store/authStore";
import { useLocationSharing } from "../../hooks/useLocationSharing";

export default function MapMarkedLocation({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { conversationId } = route?.params || {};
  const mapRef = useRef<MapView>(null);
  const currentAuthUser = useAuthStore((state) => state.user);

  const [bottomSheetVisible, setBottomSheetVisible] = useState(true);

  // --- HOOKS ---
  // Fetch conversation data (for user info, transaction, etc.)
  const {
    data: conversationData,
    isLoading: isConversationLoading,
    error: conversationError,
  } = useConversation(conversationId);

  // Location sharing hook - provides all location state and actions
  const {
    startSharing,
    stopSharing,
    isStarting,
    isStopping,
    isSharing,
    oppositeUserSharing,
    myDistance,
    oppositeUserDistance,
    nearbyPlaces,
    session,
    locationUpdates,
    isLoading: isSessionLoading,
  } = useLocationSharing({
    conversationId,
    userId: currentAuthUser?.id,
    oppositeUserName: conversationData?.oppositeUser?.displayName,
    enabled: true,
  });

  // Note: Socket handlers and query management are now handled entirely by useLocationSharing hook
  // No need for duplicate socket handlers here

  // --- MEMOIZED STATE ---
  // Compute participant-specific data for map markers
  const { participant1Update, participant2Update, participant1Info, participant2Info } = useMemo(() => {
    if (!session || !conversationData || !currentAuthUser) {
      return {
        participant1Update: null,
        participant2Update: null,
        participant1Info: null,
        participant2Info: null,
      };
    }

    const participant1Id = conversationData.participant1Id;
    const isCurrentUserP1 = currentAuthUser.id === participant1Id;

    // Location updates
    const myUpdate = locationUpdates.find(
      (u: any) => u.userId === currentAuthUser.id
    );
    const oppositeUpdate = locationUpdates.find(
      (u: any) => u.userId !== currentAuthUser.id
    );

    // Participant markers on map - only show if user is sharing
    const participant1Update = session.participant1Sharing
      ? isCurrentUserP1
        ? myUpdate
        : oppositeUpdate
      : null;
    const participant2Update = session.participant2Sharing
      ? !isCurrentUserP1
        ? myUpdate
        : oppositeUpdate
      : null;

    // Participant info for markers
    const participant1Info = {
      displayName: isCurrentUserP1
        ? currentAuthUser.displayName
        : conversationData.oppositeUser?.displayName || "User",
      avatarUrl: isCurrentUserP1
        ? currentAuthUser.avatarUrl
        : conversationData.oppositeUser?.avatarUrl || null,
      isCurrentUser: isCurrentUserP1,
    };

    const participant2Info = {
      displayName: !isCurrentUserP1
        ? currentAuthUser.displayName
        : conversationData.oppositeUser?.displayName || "User",
      avatarUrl: !isCurrentUserP1
        ? currentAuthUser.avatarUrl
        : conversationData.oppositeUser?.avatarUrl || null,
      isCurrentUser: !isCurrentUserP1,
    };

    return {
      participant1Update,
      participant2Update,
      participant1Info,
      participant2Info,
    };
  }, [session, locationUpdates, conversationData, currentAuthUser]);

  // --- RENDER LOGIC ---
  if (isConversationLoading || isSessionLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D3F81" />
        </View>
      </SafeAreaView>
    );
  }

  if (conversationError || !conversationData?.transaction) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-inter-bold text-neutral-900 mb-2">
            Transaction Not Found
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
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

  const { transaction, product, oppositeUser, offer, buy, bid } =
    conversationData;
  const coordinates = transaction.meetupCoordinates;

  const initialRegion: Region = coordinates
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

  const renderUserMarker = (
    latitude: string,
    longitude: string,
    distance: string | null,
    displayName: string,
    avatarUrl: string | null,
    isCurrentUser: boolean
  ) => (
    <Marker
      key={`marker-${isCurrentUser ? "current" : "opposite"}`}
      coordinate={{
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      }}
      title={isCurrentUser ? "You" : displayName}
      description={distance ? `${distance} from meetup` : undefined}
    >
      <View
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 5,
        }}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "white",
            }}
          />
        ) : (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 20,
              backgroundColor: isCurrentUser ? "#0D3F81" : "#10B981",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "white",
            }}
          >
            <Text className="text-base font-inter-medium text-white">
              {displayName?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}
      </View>
    </Marker>
  );

  return (
    <View className="flex-1">
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
            pinColor="#0D3F81"
          />
        )}

        {participant1Update &&
          participant1Info &&
          renderUserMarker(
            participant1Update.latitude,
            participant1Update.longitude,
            participant1Update.distance,
            participant1Info.displayName,
            participant1Info.avatarUrl,
            participant1Info.isCurrentUser
          )}

        {participant2Update &&
          participant2Info &&
          renderUserMarker(
            participant2Update.latitude,
            participant2Update.longitude,
            participant2Update.distance,
            participant2Info.displayName,
            participant2Info.avatarUrl,
            participant2Info.isCurrentUser
          )}

        {/* Nearby Places Markers */}
        {nearbyPlaces &&
          nearbyPlaces.length > 0 &&
          nearbyPlaces.map((place, index) => {
            if (!place.location) return null;

            return (
              <Marker
                key={`place-${index}`}
                coordinate={{
                  latitude: place.location.lat,
                  longitude: place.location.lng,
                }}
                title={place.name}
                description={place.address}
              >
                <View
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 5,
                  }}
                >
                  <LocationRippleColorIcon size={32} />
                </View>
              </Marker>
            );
          })}
      </MapView>

      <SafeAreaView className="absolute top-0 left-0 right-0">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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

      <TransactionDetailsBottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        transaction={transaction}
        product={product}
        oppositeUser={oppositeUser}
        offer={offer || null}
        buy={buy || null}
        bid={bid || null}
        conversationId={conversationId}
        navigation={navigation}
        // Pass down all state and actions
        isSharing={isSharing}
        oppositeUserSharing={oppositeUserSharing}
        myDistance={myDistance}
        oppositeUserDistance={oppositeUserDistance}
        nearbyPlaces={nearbyPlaces}
        startSharing={startSharing}
        stopSharing={stopSharing}
        isStarting={isStarting}
        isStopping={isStopping}
      />
    </View>
  );
}
