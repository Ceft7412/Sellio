import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";
import { PersonOutlineIcon } from "../../components/icons/outline/person-outline";
import { useAuthStore } from "../../store/authStore";
import { CameraRegularIcon } from "../../components/icons/outline/camera-outline";
import { DocumentTextRegularIcon } from "../../components/icons/outline/document-outline";
import { usersAPI } from "../../constants/axios";
import { useMutation } from "@tanstack/react-query";

export default function EditProfileScreen({ navigation }: any) {
  const { user, setUser } = useAuthStore();

  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(
    (user as any)?.phoneNumber || ""
  );
  const [bio, setBio] = useState((user as any)?.bio || "");
  const [location, setLocation] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    user?.avatarUrl || null
  );
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    // Load existing user data
    if (user) {
      setDisplayName(user.displayName || "");
      setPhoneNumber((user as any).phoneNumber || "");
      setBio((user as any).bio || "");
      setSelectedAvatar(user.avatarUrl || null);

      // Load existing business document if available
      const businessDocs = (user as any).businessDocuments;

      if (businessDocs && businessDocs.url) {
        setSelectedDocument({
          name: businessDocs.name || "business_document.jpg",
          uri: businessDocs.url,
          type: "image/jpeg",
          isExisting: true, // Flag to indicate this is from database
        });
      } else {
        // Clear document if none exists
        setSelectedDocument(null);
      }
    }
  }, [user]);

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const validatePhilippinesPhone = (phone: string): boolean => {
    // Philippines format: 639XXXXXXXXX (12 digits total)
    const phoneRegex = /^639\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, "");
    setPhoneNumber(cleaned);

    // Validate as user types
    if (cleaned.length > 0) {
      if (!cleaned.startsWith("63")) {
        setPhoneError("Phone must start with 63");
      } else if (cleaned.length === 3 && cleaned[2] !== "9") {
        setPhoneError("Philippines mobile numbers start with 639");
      } else if (cleaned.length > 12) {
        setPhoneError("Phone number is too long");
      } else if (cleaned.length === 12 && !validatePhilippinesPhone(cleaned)) {
        setPhoneError("Invalid Philippines phone number");
      } else if (cleaned.length < 12) {
        setPhoneError("Phone number must be 12 digits (639XXXXXXXXX)");
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("");
    }
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedAvatar(result.assets[0].uri);
    }
  };

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Media library permission is required to select photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedAvatar(result.assets[0].uri);
    }
  };

  const handleChooseAvatar = () => {
    Alert.alert("Change Profile Picture", "Choose an option", [
      {
        text: "Take Photo",
        onPress: pickImageFromCamera,
      },
      {
        text: "Choose from Library",
        onPress: pickImageFromLibrary,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const pickDocumentFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedDocument({
        name: "business_document.jpg",
        uri: result.assets[0].uri,
        type: "image/jpeg",
      });
    }
  };

  const pickDocumentFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Media library permission is required to select photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedDocument({
        name: "business_document.jpg",
        uri: result.assets[0].uri,
        type: "image/jpeg",
      });
    }
  };

  const handleUploadDocument = () => {
    Alert.alert("Upload Business Document", "Choose an option", [
      {
        text: "Take Photo",
        onPress: pickDocumentFromCamera,
      },
      {
        text: "Choose from Library",
        onPress: pickDocumentFromLibrary,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleRemoveDocument = () => {
    Alert.alert(
      "Remove Document",
      "Are you sure you want to remove this document? Changes will be saved when you tap Save Changes.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSelectedDocument(null);
          },
        },
      ]
    );
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      displayName?: string;
      phoneNumber?: string;
      bio?: string;
      avatarUrl?: string;
      businessDocuments?: any;
    }) => usersAPI.updateProfile(data),
    onSuccess: (response) => {
      // Update the auth store with new user data
      setUser(response.data.user);
      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            handleBack();
          },
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile"
      );
    },
  });

  const uploadImage = async (
    imageUri: string,
    endpoint: string = "avatar"
  ): Promise<string> => {
    try {
      // Get auth token
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("authToken");

      // Create form data
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const API_BASE_URL =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";
      const API_KEY = process.env.EXPO_PUBLIC_APP_API_KEY;

      // Upload to backend endpoint
      const response = await fetch(`${API_BASE_URL}/upload/${endpoint}`, {
        method: "POST",
        body: formData,
        headers: {
          "X-API-Key": API_KEY || "",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      throw error;
    }
  };

  const handleSave = async () => {
    // Validation
    if (!displayName.trim()) {
      Alert.alert("Error", "Display name is required");
      return;
    }

    if (displayName.trim().length < 3) {
      Alert.alert("Error", "Display name must be at least 3 characters");
      return;
    }

    if (phoneNumber && !validatePhilippinesPhone(phoneNumber)) {
      Alert.alert(
        "Error",
        "Please enter a valid Philippines phone number (639XXXXXXXXX)"
      );
      return;
    }

    if (bio.length > 500) {
      Alert.alert("Error", "Bio must not exceed 500 characters");
      return;
    }

    setIsLoading(true);

    try {
      let avatarUrl = user?.avatarUrl;
      let businessDocumentUrl = null;

      // Upload new avatar if changed
      if (
        selectedAvatar &&
        selectedAvatar !== user?.avatarUrl &&
        selectedAvatar.startsWith("file://")
      ) {
        try {
          avatarUrl = await uploadImage(selectedAvatar, "avatar");
        } catch (error) {
          Alert.alert("Warning", "Failed to upload avatar, continuing...");
        }
      }

      // Upload business document if provided (only if it's a new one)
      if (selectedDocument && selectedDocument.uri && user?.identityVerified) {
        // Check if it's a new document (not from database)
        if (!selectedDocument.isExisting) {
          try {
            businessDocumentUrl = await uploadImage(
              selectedDocument.uri,
              "document"
            );
          } catch (error) {
            Alert.alert(
              "Warning",
              "Failed to upload business document, continuing..."
            );
          }
        } else {
          // Keep existing document URL
          businessDocumentUrl = selectedDocument.uri;
        }
      }

      // Prepare update data
      const updateData: any = {
        displayName: displayName.trim(),
        bio: bio.trim(),
      };

      // Only include phone number if it's valid and not empty
      if (phoneNumber && phoneNumber.trim()) {
        updateData.phoneNumber = phoneNumber.trim();
      }

      // Only include avatar URL if it changed
      if (avatarUrl !== user?.avatarUrl) {
        updateData.avatarUrl = avatarUrl;
      }

      // Handle business documents
      if (user?.identityVerified) {
        if (businessDocumentUrl) {
          // Update or keep business document
          updateData.businessDocuments = {
            url: businessDocumentUrl,
            name: selectedDocument.name,
            uploadedAt:
              selectedDocument.isExisting &&
              (user as any).businessDocuments?.uploadedAt
                ? (user as any).businessDocuments.uploadedAt
                : new Date().toISOString(),
          };
        } else if (!selectedDocument) {
          // Document was removed, set to null
          updateData.businessDocuments = null;
        }
      }

      await updateProfileMutation.mutateAsync(updateData);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-neutral-100">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-inter-bold text-primary-500">
            Edit Profile
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        {/* Avatar Section */}
        <View className="items-center py-8 bg-white mb-4">
          <TouchableOpacity
            onPress={handleChooseAvatar}
            className="relative mb-3"
            activeOpacity={0.7}
          >
            {selectedAvatar ? (
              <Image
                source={{ uri: selectedAvatar }}
                className="w-28 h-28 rounded-full"
              />
            ) : (
              <View className="w-28 h-28 rounded-full bg-primary-100 items-center justify-center">
                <PersonOutlineIcon size={56} color="#0D3F81" />
              </View>
            )}
            {/* Camera Badge */}
            <View className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-500 items-center justify-center border-4 border-white">
              <CameraRegularIcon color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleChooseAvatar} activeOpacity={0.7}>
            <Text className="text-sm font-inter-semiBold text-primary-500">
              Change Profile Picture
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="px-6">
          {/* Display Name */}
          <View className="mb-4">
            <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
              Display Name <Text className="text-error-500">*</Text>
            </Text>
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-neutral-200 rounded-xl font-inter-regular text-neutral-900 text-base"
              placeholder="Enter your display name"
              placeholderTextColor="#9CA3AF"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          </View>

          {/* Email (Read-only) */}
          <View className="mb-4">
            <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
              Email
            </Text>
            <View className="w-full px-4 py-3.5 bg-neutral-100 border border-neutral-200 rounded-xl flex-row items-center">
              <Text className="flex-1 font-inter-regular text-neutral-600 text-base">
                {user?.email || "email@example.com"}
              </Text>
              <View className="bg-neutral-200 px-2 py-1 rounded">
                <Text className="text-xs font-inter-medium text-neutral-600">
                  Read-only
                </Text>
              </View>
            </View>
            <Text className="text-xs font-inter-regular text-neutral-500 mt-1">
              Email cannot be changed. Contact support if needed.
            </Text>
          </View>

          {/* Phone Number */}
          <View className="mb-4">
            <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
              Phone Number
            </Text>
            <TextInput
              className={`w-full px-4 py-3.5 bg-white border rounded-xl font-inter-regular text-neutral-900 text-base ${
                phoneError ? "border-error-500" : "border-neutral-200"
              }`}
              placeholder="639XXXXXXXXX"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={12}
            />
            {phoneError ? (
              <Text className="text-xs font-inter-regular text-error-500 mt-1">
                {phoneError}
              </Text>
            ) : (
              <Text className="text-xs font-inter-regular text-neutral-500 mt-1">
                Format: 639XXXXXXXXX (Philippines mobile)
              </Text>
            )}
          </View>

          {/* Location */}
          <View className="mb-4">
            <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
              Location
            </Text>
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-neutral-200 rounded-xl font-inter-regular text-neutral-900 text-base"
              placeholder="City, State"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
          </View>

          {/* Bio */}
          <View className="mb-6">
            <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
              Bio
            </Text>
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-neutral-200 rounded-xl font-inter-regular text-neutral-900 text-base"
              placeholder="Tell us about yourself..."
              placeholderTextColor="#9CA3AF"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
            />
            <Text className="text-xs font-inter-regular text-neutral-500 mt-1">
              {bio.length}/500 characters
            </Text>
          </View>

          {/* Business Document Section (Only for verified users) */}
          {user?.identityVerified && (
            <View className="mb-6 p-4 bg-white rounded-2xl border border-neutral-200">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center mr-3">
                  <DocumentTextRegularIcon size={20} color="#0D3F81" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-inter-semiBold text-neutral-900">
                    Business Documents
                  </Text>
                  <Text className="text-xs font-inter-regular text-neutral-500">
                    Optional - Take a photo of your business license or tax ID
                  </Text>
                </View>
              </View>

              {selectedDocument ? (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      // Open full image view
                      navigation.navigate("general", {
                        screen: "imageViewer",
                        params: { imageUrl: selectedDocument.uri },
                      } as never);
                    }}
                    className="mb-2"
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: selectedDocument.uri }}
                      className="w-32 h-32 rounded-xl"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-inter-regular text-success-600 flex-1">
                      Tap image to view full size
                    </Text>
                    <TouchableOpacity
                      onPress={handleRemoveDocument}
                      className="px-3 py-1.5 bg-error-50 border border-error-200 rounded-lg"
                      activeOpacity={0.7}
                    >
                      <Text className="text-xs font-inter-semiBold text-error-600">
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleUploadDocument}
                  className="p-4 border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 items-center active:bg-neutral-100"
                  activeOpacity={0.7}
                >
                  <CameraRegularIcon size={40} color="#0D3F81" />
                  <Text className="text-sm font-inter-semiBold text-neutral-700 mb-1">
                    Take Photo of Document
                  </Text>
                  <Text className="text-xs font-inter-regular text-neutral-500 text-center">
                    Business license, tax ID, or permit
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Account Info Card */}
          <View className="mb-6 p-4 bg-primary-50 rounded-2xl border border-primary-100">
            <View className="flex-row items-center mb-2">
              <Text className="text-sm font-inter-semiBold text-primary-900">
                Account Status
              </Text>
            </View>
            {/* {user?.emailVerified && (
              <View className="flex-row items-center mb-1">
                <View className="w-1.5 h-1.5 rounded-full bg-success-500 mr-2" />
                <Text className="text-xs font-inter-regular text-neutral-700">
                  Email verified
                </Text>
              </View>
            )} */}
            {user?.identityVerified ? (
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-success-500 mr-2" />
                <Text className="text-xs font-inter-regular text-neutral-700">
                  Identity verified - Can sell items
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-warning-500 mr-2" />
                <Text className="text-xs font-inter-regular text-neutral-700">
                  Identity not verified - Limited features
                </Text>
              </View>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl mb-4 ${
              isLoading ? "bg-primary-300" : "bg-primary-500"
            } active:bg-primary-600`}
          >
            <Text className="text-center text-white text-base font-inter-semiBold">
              {isLoading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={handleBack}
            className="w-full py-4 rounded-xl border-2 border-neutral-200 bg-white active:bg-neutral-50"
          >
            <Text className="text-center text-neutral-700 text-base font-inter-semiBold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
