import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
}

interface SelectLocationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: LocationCoordinates) => void;
}

export const SelectLocationBottomSheet: React.FC<
  SelectLocationBottomSheetProps
> = ({ visible, onClose, onConfirm }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationCoordinates | null>(null);
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  // Default location (Davao City, Philippines)
  const [region, setRegion] = useState({
    latitude: 7.0716,
    longitude: 125.6128,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter a location to search");
      return;
    }

    setIsSearching(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_GEOCODING_API_KEY;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: searchQuery,
            key: apiKey,
            components: "country:PH", // Restrict to Philippines
          },
        }
      );

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;
        const address = result.formatted_address;

        const newLocation = {
          lat: location.lat,
          lng: location.lng,
          address: address,
        };

        setSelectedLocation(newLocation);

        // Animate map to the location
        const newRegion = {
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);

        mapRef.current?.animateToRegion(newRegion, 500);
      } else {
        Alert.alert("Not Found", "Location not found. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Reverse geocode to get address
    setIsSearching(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_GEOCODING_API_KEY;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${latitude},${longitude}`,
            key: apiKey,
          },
        }
      );

      if (response.data.results && response.data.results.length > 0) {
        const address = response.data.results[0].formatted_address;
        setSelectedLocation({
          lat: latitude,
          lng: longitude,
          address: address,
        });
        setSearchQuery(address);
      }
    } catch (error) {
      // Still set location even if reverse geocoding fails
      setSelectedLocation({
        lat: latitude,
        lng: longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      Alert.alert("Error", "Please select a location on the map");
      return;
    }
    onConfirm(selectedLocation);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedLocation(null);
    setRegion({
      latitude: 14.5995,
      longitude: 120.9842,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className={`flex-1 bg-white mt-16 pb-20`}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2 border-b border-neutral-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-inter-bold text-neutral-900">
              Select Location
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-base font-inter-semibold text-primary-500">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search location..."
                className="px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-inter-regular text-base"
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity
              onPress={handleSearch}
              disabled={isSearching}
              className="px-4 py-3 rounded-xl bg-primary-500 items-center justify-center"
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-base font-inter-semibold text-white">
                  Search
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Selected Location Display */}
          {selectedLocation && (
            <View className="bg-primary-50 rounded-xl p-3 mb-2">
              <Text className="text-xs font-inter-medium text-primary-700 mb-1">
                Selected Location
              </Text>
              <Text className="text-sm font-inter-regular text-primary-900">
                {selectedLocation.address}
              </Text>
            </View>
          )}
        </View>

        {/* Map */}
        <View className="flex-1">
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={region}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.lat,
                  longitude: selectedLocation.lng,
                }}
                title="Meetup Location"
                description={selectedLocation.address}
              />
            )}
          </MapView>
        </View>

        {/* Confirm Button */}
        <View className="px-4 py-4 border-t border-neutral-200">
          <Text className="text-sm font-inter-regular text-neutral-600 mb-3 text-center">
            Tap on the map to select a location or search above
          </Text>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!selectedLocation}
            className={`py-4 rounded-xl items-center ${
              selectedLocation ? "bg-primary-500" : "bg-neutral-200"
            }`}
          >
            <Text
              className={`text-base font-inter-semibold ${
                selectedLocation ? "text-white" : "text-neutral-400"
              }`}
            >
              Confirm Location
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
