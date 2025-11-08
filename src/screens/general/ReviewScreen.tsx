import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeftRegularIcon } from "../../components/icons/outline/chevron-left";
import * as ImagePicker from "expo-image-picker";
import { transactionsAPI } from "../../constants/axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CameraRegularIcon } from "../../components/icons/outline/camera-outline";
import { CloseOutlineIcon } from "../../components/icons/outline/close-outline";
import { StarColorIcon } from "../../components/icons/fill/star-color-fill";
import { StarRegularIcon } from "../../components/icons/outline/star-outline";

interface RouteParams {
  transactionId: string;
  revieweeName: string;
  revieweeAvatar?: string;
  productTitle?: string;
}

export default function ReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactionId, revieweeName, revieweeAvatar, productTitle } =
    route.params as RouteParams;

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - images.length,
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset) => asset.uri);
        setImages([...images, ...newImages].slice(0, 5));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating");
      return;
    }

    if (reviewText.trim().length === 0) {
      Alert.alert("Review Required", "Please write a review");
      return;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert("Review Too Short", "Please write at least 10 characters");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("reviewText", reviewText.trim());
      formData.append("isAnonymous", isAnonymous.toString());

      // Append images if any
      images.forEach((imageUri, index) => {
        const uriParts = imageUri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("images", {
          uri: imageUri,
          name: `review_image_${index}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      });

      await transactionsAPI.createReview(transactionId, formData);

      Alert.alert("Success", "Your review has been submitted successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to submit review"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View className="flex-row items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            className="p-1"
          >
            {star <= rating ? (
              <StarColorIcon size={40} color="#F59E0B" />
            ) : (
              <StarRegularIcon size={40} color="#D1D5DB" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-neutral-200 flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3 w-10 h-10 items-center justify-center"
        >
          <ChevronLeftRegularIcon size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-inter-bold text-neutral-900 flex-1">
          Leave a Review
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Reviewee Info */}
          <View className="bg-neutral-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              {revieweeAvatar ? (
                <Image
                  source={{ uri: revieweeAvatar }}
                  className="w-12 h-12 rounded-full mr-3"
                />
              ) : (
                <View className="w-12 h-12 rounded-full mr-3 bg-primary-100 items-center justify-center">
                  <Text className="text-lg font-inter-medium text-primary-500">
                    {revieweeName.charAt(0)}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-sm font-inter-regular text-neutral-600">
                  You're reviewing
                </Text>
                <Text className="text-base font-inter-semiBold text-neutral-900">
                  {revieweeName}
                </Text>
              </View>
            </View>
            {productTitle && (
              <Text className="text-xs font-inter-regular text-neutral-500 mt-2">
                Product: {productTitle}
              </Text>
            )}
          </View>

          {/* Rating Section */}
          <View className="mb-6">
            <Text className="text-base font-inter-semiBold text-neutral-900 mb-3">
              How was your experience?
            </Text>
            {renderStars()}
            {rating > 0 && (
              <Text className="text-center text-sm font-inter-medium text-neutral-600 mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </Text>
            )}
          </View>

          {/* Review Text Section */}
          <View className="mb-6">
            <Text className="text-base font-inter-semiBold text-neutral-900 mb-3">
              Write your review
            </Text>
            <TextInput
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Share details of your experience..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-neutral-50 rounded-xl p-4 text-base font-inter-regular text-neutral-900 min-h-[150px]"
              maxLength={500}
            />
            <Text className="text-xs font-inter-regular text-neutral-500 mt-1 text-right">
              {reviewText.length}/500
            </Text>
          </View>

          {/* Images Section */}
          <View className="mb-6">
            <Text className="text-base font-inter-semiBold text-neutral-900 mb-3">
              Add Photos (Optional)
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {images.length < 5 && (
                <TouchableOpacity
                  onPress={handleSelectImage}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-neutral-300 items-center justify-center bg-neutral-50"
                >
                  <CameraRegularIcon size={24} color="#9CA3AF" />
                  <Text className="text-xs font-inter-medium text-neutral-500 mt-1">
                    Add
                  </Text>
                </TouchableOpacity>
              )}
              {images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-error-500 rounded-full p-1"
                  >
                    <CloseOutlineIcon size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <Text className="text-xs font-inter-regular text-neutral-500 mt-2">
              You can add up to 5 photos
            </Text>
          </View>

          {/* Anonymous Option */}
          <TouchableOpacity
            onPress={() => setIsAnonymous(!isAnonymous)}
            className="flex-row items-center mb-6 p-4 bg-neutral-50 rounded-xl"
          >
            <View
              className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                isAnonymous
                  ? "bg-primary-500 border-primary-500"
                  : "border-neutral-300"
              }`}
            >
              {isAnonymous && <Text className="text-white text-xs">✓</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-inter-medium text-neutral-900">
                Post anonymously
              </Text>
              <Text className="text-xs font-inter-regular text-neutral-500 mt-0.5">
                Your name and profile picture will be hidden
              </Text>
            </View>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={
              isSubmitting || rating === 0 || reviewText.trim().length === 0
            }
            className={`rounded-xl py-4 items-center ${
              isSubmitting || rating === 0 || reviewText.trim().length === 0
                ? "bg-neutral-300"
                : "bg-primary-500"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-inter-semiBold text-white">
                Submit Review
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
