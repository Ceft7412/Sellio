import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";
import { CameraRegularIcon } from "../../components/icons/outline/camera-outline";
import { CheckRegularIcon } from "../../components/icons/outline/check-outline";
import { convertImageToBase64 } from "../../utils/imageHelpers";
import { idAnalyzerAPI } from "../../constants/idAnalyzer";
import { userAPI } from "../../constants/axios";
import { useAuthStore } from "../../store/authStore";
import FullScreendLoadingWithMessage from "../../components/states/loading/FullScreendLoadingWithMessage";
import StatusErrorModal from "../../components/states/error/StatusErrorModal";
import FullScreenSuccess from "../../components/states/success/FullScreenSuccess";
import { RibbonOutlineIcon } from "../../components/icons/outline/ribbon-outline";

const { width } = Dimensions.get("window");

interface IDImages {
  front: string | null;
  back: string | null;
}

export default function IdentityVerificationScreen({ navigation }: any) {
  const { refreshUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [idImages, setIdImages] = useState<IDImages>({
    front: null,
    back: null,
  });
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [statusErrorModalVisible, setStatusErrorModalVisible] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState({
    title: "",
    message: "",
  });
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  // Camera permissions for selfie
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Auto-initialize camera when entering Step 2
  React.useEffect(() => {
    if (currentStep === 2 && !selfie) {
      initializeCamera();
    }
  }, [currentStep, selfie]);

  const initializeCamera = async () => {
    if (!cameraPermission?.granted) {
      await requestCameraPermission();
    }
  };

  const handleBack = () => {
    if (currentStep === 2 && selfie) {
      // If on step 2 with selfie taken, go back to step 1
      Alert.alert(
        "Go Back?",
        "Your ID verification will be lost. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go Back", onPress: () => setCurrentStep(1) },
        ]
      );
      return;
    }
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  // Upload image - no API call needed, just show loading state
  const uploadImage = (type: string): Promise<void> => {
    return new Promise((resolve) => {
      setUploadingType(type);
      setTimeout(() => {
        setUploadingType(null);
        resolve();
      }, 500); // Brief delay for UX
    });
  };

  // No API call in Step 1 - just proceed to selfie

  // Submit complete verification with all images (ID + Face)
  const submitFinalVerification = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Convert all images to base64
      const frontBase64 = await convertImageToBase64(idImages.front!);
      const backBase64 = await convertImageToBase64(idImages.back!);
      const faceBase64 = await convertImageToBase64(selfie!);

      const result = await idAnalyzerAPI.verifyIDDocument(
        frontBase64,
        backBase64,
        faceBase64
      );

      if (!result.success) {
        setErrorModalContent({
          title: "Verification Failed",
          message:
            result.error?.message ||
            "Failed to verify your identity. Please ensure all images are clear and match.",
        });
        setStatusErrorModalVisible(true);
        return false;
      }

      // Check decision from API response
      const { decision, warning } = result.data;

      // Handle reject or review decisions
      if (decision === "reject" || decision === "review") {
        // Check for specific warning codes
        const hasFaceMismatch = warning?.some(
          (w: any) => w.code === "FACE_MISMATCH"
        );
        const hasBlurryImage = warning?.some(
          (w: any) => w.code === "IMAGE_TOO_BLURRY"
        );

        if (hasFaceMismatch) {
          setErrorModalContent({
            title: "Face Mismatch",
            message:
              "The face in your selfie doesn't match the photo on your ID. Please try again with clear images.",
          });
        } else if (hasBlurryImage) {
          setErrorModalContent({
            title: "Image Quality Too Low",
            message:
              "Your images are too blurry. Please retake clear photos and try again.",
          });
        } else {
          setErrorModalContent({
            title: "Verification Failed",
            message:
              "We couldn't verify your identity. Please ensure all images are clear and match your ID.",
          });
        }

        setStatusErrorModalVisible(true);
        return false;
      }

      // Handle accept decision - call backend API
      if (decision === "accept") {
        try {
          await userAPI.verifyIdentity();

          // Refresh user data to reflect verified status
          await refreshUser();

          // Show success modal
          setSuccessModalVisible(true);
          return true;
        } catch (backendError: any) {
          setErrorModalContent({
            title: "Server Error",
            message:
              "Verification succeeded but failed to update your account. Please contact support.",
          });
          setStatusErrorModalVisible(true);
          return false;
        }
      }

      return false;
    } catch (error: any) {
      setErrorModalContent({
        title: "Error",
        message: "An unexpected error occurred. Please try again.",
      });
      setStatusErrorModalVisible(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const showImageSourceOptions = (type: "front" | "back") => {
    Alert.alert(
      "Upload ID",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => handleTakePhoto(type),
        },
        {
          text: "Choose from Gallery",
          onPress: () => handlePickImage(type),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleTakePhoto = async (type: "front" | "back") => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(type === "front" ? "ID Front" : "ID Back");
      setIdImages((prev) => ({ ...prev, [type]: result.assets[0].uri }));
    }
  };

  const handlePickImage = async (type: "front" | "back") => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Gallery permission is required to select photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(type === "front" ? "ID Front" : "ID Back");
      setIdImages((prev) => ({ ...prev, [type]: result.assets[0].uri }));
    }
  };

  const handleContinueToSelfie = async () => {
    if (!idImages.front || !idImages.back) {
      Alert.alert(
        "Missing Images",
        "Please upload both front and back of your ID."
      );
      return;
    }

    // Request camera permission before moving to selfie step
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to take a selfie for verification."
        );
        return;
      }
    }

    // Proceed to Step 2 (verification will happen after selfie is taken)
    setCurrentStep(2);
  };

  const handleTakeSelfie = async () => {
    if (cameraRef.current) {
      try {
        setUploadingType("Selfie");
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo) {
          await uploadImage("Selfie");
          setSelfie(photo.uri);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to capture selfie. Please try again.");
      } finally {
        setUploadingType(null);
      }
    }
  };

  const handleRetakeSelfie = () => {
    setSelfie(null);
  };

  const handleSubmitVerification = async () => {
    if (!idImages.front || !idImages.back || !selfie) {
      Alert.alert("Incomplete", "Please complete all verification steps.");
      return;
    }

    await submitFinalVerification();
    // Success/error handling is now done in submitFinalVerification via modals
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-neutral-100 ">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeftOutlineIcon size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-inter-bold text-primary-500">
            Identity Verification
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-neutral-50"
      >
        <View className="px-6 py-6">
          {/* Step 1: ID Upload */}
          {currentStep === 1 && (
            <>
              <Text className="text-2xl font-inter-bold text-neutral-900 mb-2">
                Upload Your ID
              </Text>
              <Text className="text-base font-inter-regular text-neutral-600 mb-6">
                Please upload clear photos of the front and back of your
                government-issued ID.
              </Text>

              {/* ID Front */}
              <View className="mb-4">
                <Text className="text-sm font-inter-semiBold text-neutral-700 mb-3">
                  ID Front
                </Text>
                <TouchableOpacity
                  onPress={() => showImageSourceOptions("front")}
                  className="relative"
                  activeOpacity={0.7}
                  disabled={uploadingType === "ID Front"}
                >
                  {idImages.front ? (
                    <View className="relative">
                      <Image
                        source={{ uri: idImages.front }}
                        className="w-full h-48 rounded-2xl"
                        resizeMode="cover"
                      />
                      <View className="absolute inset-0 bg-black/20 rounded-2xl items-center justify-center">
                        <View className="bg-white/90 px-4 py-2 rounded-xl">
                          <Text className="text-sm font-inter-semiBold text-neutral-900">
                            Tap to Change
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View
                      className="w-full h-48 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 items-center justify-center"
                      style={{ borderStyle: "dashed" }}
                    >
                      {uploadingType === "ID Front" ? (
                        <View className="items-center">
                          <ActivityIndicator size="large" color="#0D3F81" />
                          <Text className="text-sm font-inter-medium text-neutral-600 mt-3">
                            Uploading...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <CameraRegularIcon size={48} color="#9CA3AF" />
                          <Text className="text-base font-inter-semiBold text-neutral-700 mt-3">
                            Upload ID Front
                          </Text>
                          <Text className="text-sm font-inter-regular text-neutral-500 mt-1">
                            Tap to take photo or choose from gallery
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* ID Back */}
              <View className="mb-6">
                <Text className="text-sm font-inter-semiBold text-neutral-700 mb-3">
                  ID Back
                </Text>
                <TouchableOpacity
                  onPress={() => showImageSourceOptions("back")}
                  className="relative"
                  activeOpacity={0.7}
                  disabled={uploadingType === "ID Back"}
                >
                  {idImages.back ? (
                    <View className="relative">
                      <Image
                        source={{ uri: idImages.back }}
                        className="w-full h-48 rounded-2xl"
                        resizeMode="cover"
                      />
                      <View className="absolute inset-0 bg-black/20 rounded-2xl items-center justify-center">
                        <View className="bg-white/90 px-4 py-2 rounded-xl">
                          <Text className="text-sm font-inter-semiBold text-neutral-900">
                            Tap to Change
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View
                      className="w-full h-48 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 items-center justify-center"
                      style={{ borderStyle: "dashed" }}
                    >
                      {uploadingType === "ID Back" ? (
                        <View className="items-center">
                          <ActivityIndicator size="large" color="#0D3F81" />
                          <Text className="text-sm font-inter-medium text-neutral-600 mt-3">
                            Uploading...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <CameraRegularIcon size={48} color="#9CA3AF" />
                          <Text className="text-base font-inter-semiBold text-neutral-700 mt-3">
                            Upload ID Back
                          </Text>
                          <Text className="text-sm font-inter-regular text-neutral-500 mt-1">
                            Tap to take photo or choose from gallery
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                onPress={handleContinueToSelfie}
                className={`w-full py-4 rounded-xl ${
                  idImages.front && idImages.back
                    ? "bg-primary-500"
                    : "bg-neutral-300"
                }`}
                activeOpacity={0.7}
                disabled={!idImages.front || !idImages.back}
              >
                <Text className="text-center text-white text-base font-inter-semiBold">
                  Continue to Selfie
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: Selfie */}
          {currentStep === 2 && (
            <>
              <Text className="text-2xl font-inter-bold text-neutral-900 mb-2">
                Take a Selfie
              </Text>
              <Text className="text-base font-inter-regular text-neutral-600 mb-6">
                Take a clear selfie to verify your identity. Make sure your face
                is clearly visible and matches your ID photo.
              </Text>

              {/* Camera View or Selfie Preview */}
              <View className="mb-6">
                {selfie ? (
                  // Selfie Preview - Circular
                  <View className="w-full h-[300px] rounded-2xl items-center justify-center mb-20">
                    {/* Circular Selfie Preview */}
                    <View
                      style={{
                        width: width * 0.6,
                        height: width * 0.6,
                        borderRadius: (width * 0.6) / 2,
                        overflow: "hidden",
                        borderWidth: 4,
                        borderColor: "#10B981",
                        borderStyle: "solid",
                      }}
                    >
                      <Image
                        source={{ uri: selfie }}
                        style={{
                          width: "100%",
                          height: "100%",
                          transform: [{ scaleX: -1 }], // Mirror the image to match camera preview
                        }}
                        resizeMode="cover"
                      />
                    </View>

                    {/* Retake Button */}
                    <TouchableOpacity
                      onPress={handleRetakeSelfie}
                      className="mt-6 "
                      activeOpacity={0.7}
                    >
                      <View className="bg-neutral-200 px-6 py-3 rounded-xl">
                        <Text className="text-center text-base font-inter-semiBold text-neutral-900">
                          Retake Selfie
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Camera View - Only in Circle
                  <View className="w-full h-[300px] rounded-2xl items-center justify-center">
                    {cameraPermission?.granted ? (
                      <>
                        {/* Circular Camera View */}
                        <View
                          style={{
                            width: width * 0.6,
                            height: width * 0.6,
                            borderRadius: (width * 0.6) / 2,
                            overflow: "hidden",
                            borderWidth: 4,
                            borderColor: "#FFFFFF",
                            borderStyle: "dashed",
                          }}
                        >
                          <CameraView
                            ref={cameraRef}
                            style={{ flex: 1 }}
                            facing="front"
                          />
                        </View>

                        {/* Instruction Text */}
                        <Text className="text-neutral-700 text-base font-inter-medium mt-6 px-6 text-center">
                          Position your face within the circle
                        </Text>
                      </>
                    ) : (
                      <View className="items-center">
                        <ActivityIndicator size="large" color="#0D3F81" />
                        <Text className="text-sm font-inter-medium text-neutral-600 mt-3">
                          Requesting camera permission...
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Take Picture Button */}
              {!selfie && cameraPermission?.granted && (
                <TouchableOpacity
                  onPress={handleTakeSelfie}
                  className="w-[50%] mx-auto py-4 rounded-xl bg-primary-500 mb-20"
                  activeOpacity={0.7}
                  disabled={uploadingType === "Selfie"}
                >
                  {uploadingType === "Selfie" ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-center text-white text-base font-inter-semiBold ml-2">
                        Capturing...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center text-white text-base font-inter-semiBold">
                      Take Picture
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setCurrentStep(1)}
                  className="flex-1 py-4 rounded-xl border-2 border-neutral-300 bg-white"
                  activeOpacity={0.7}
                >
                  <Text className="text-center text-neutral-700 text-base font-inter-semiBold">
                    Back
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmitVerification}
                  className={`flex-1 py-4 rounded-xl items-center justify-center ${
                    selfie ? "bg-primary-500" : "bg-neutral-300"
                  }`}
                  activeOpacity={0.7}
                  disabled={!selfie || isLoading}
                >
                  <Text className="text-center text-white text-base font-inter-semiBold">
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <StatusErrorModal
        visible={statusErrorModalVisible}
        message={errorModalContent.message}
        title={errorModalContent.title}
        onConfirm={() => {
          setStatusErrorModalVisible(false);
          navigation.goBack();
        }}
      />
      {isLoading && (
        <FullScreendLoadingWithMessage message="Processing your verification... It may take a few seconds." />
      )}
      <FullScreenSuccess
        visible={successModalVisible}
        title="Identity Verified"
        message="Your identity has been verified successfully. You can now start selling items and build trust with buyers!"
        icon={
          <Image
            source={require("../../../assets/success/success-verification.png")}
            className="w-60 h-60"
          />
        }
        onConfirm={() => {
          setSuccessModalVisible(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}
