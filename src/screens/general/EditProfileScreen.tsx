import React, { useState } from "react";
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
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";
import { PersonOutlineIcon } from "../../components/icons/outline/person-outline";
import { useAuthStore } from "../../store/authStore";
import { CameraRegularIcon } from "../../components/icons/outline/camera-outline";
import { DocumentTextRegularIcon } from "../../components/icons/outline/document-outline";
import { ShareIosRegularIcon } from "../../components/icons/outline/share-outline";

export default function EditProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();

  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    user?.avatarUrl || null
  );
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleChooseAvatar = () => {
    Alert.alert("Change Profile Picture", "Choose an option", [
      {
        text: "Take Photo",
        onPress: () => {
          // TODO: Open camera
          Alert.alert("Camera", "Camera functionality to be implemented");
        },
      },
      {
        text: "Choose from Library",
        onPress: () => {
          // TODO: Open image picker
          Alert.alert(
            "Gallery",
            "Image picker functionality to be implemented"
          );
          // Simulate avatar selection
          setSelectedAvatar("https://i.pravatar.cc/300?img=68");
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleUploadDocument = () => {
    Alert.alert("Upload Business Document", "Select document type", [
      {
        text: "Business License",
        onPress: () => {
          // TODO: Open document picker
          Alert.alert("Success", "Business license uploaded (simulated)");
          setSelectedDocument("business_license.pdf");
        },
      },
      {
        text: "Tax ID",
        onPress: () => {
          // TODO: Open document picker
          Alert.alert("Success", "Tax ID uploaded (simulated)");
          setSelectedDocument("tax_id.pdf");
        },
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
      "Are you sure you want to remove this document?",
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
            Alert.alert("Success", "Document removed");
          },
        },
      ]
    );
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

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            // TODO: Update user store with new data
            handleBack();
          },
        },
      ]);
    }, 1500);
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
              className="w-full px-4 py-3.5 bg-white border border-neutral-200 rounded-xl font-inter-regular text-neutral-900 text-base"
              placeholder="Enter your phone number"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
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
                    Optional - Upload business license or tax ID
                  </Text>
                </View>
              </View>

              {selectedDocument ? (
                <View className="p-3 bg-success-50 border border-success-200 rounded-xl mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <Text className="text-2xl mr-3">📎</Text>
                      <View className="flex-1">
                        <Text
                          className="text-sm font-inter-medium text-neutral-900"
                          numberOfLines={1}
                        >
                          {selectedDocument}
                        </Text>
                        <Text className="text-xs font-inter-regular text-neutral-500">
                          Uploaded successfully
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={handleRemoveDocument}
                      className="ml-2 w-8 h-8 rounded-full bg-error-100 items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Text className="text-error-600 text-lg">×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleUploadDocument}
                  className="p-4 border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 items-center active:bg-neutral-100"
                  activeOpacity={0.7}
                >
                  <ShareIosRegularIcon size={40} color="#0D3F8180" />
                  <Text className="text-sm font-inter-semiBold text-neutral-700 mb-1">
                    Upload Document
                  </Text>
                  <Text className="text-xs font-inter-regular text-neutral-500 text-center">
                    PDF, JPG, PNG (Max 10MB)
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
