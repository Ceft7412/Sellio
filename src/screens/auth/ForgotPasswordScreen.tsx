import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";
import { MailOutlineIcon } from "../../components/icons/outline/mail-outline";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Memoized email validation function
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Memoized handler functions to prevent unnecessary rerenders
  const handleResetPassword = useCallback(async () => {
    // Reset errors
    setEmailError("");

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    // TODO: Implement password reset logic
    console.log("Reset password for:", email);
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
    }, 1000);
  }, [email, validateEmail]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleResend = useCallback(() => {
    setEmailSent(false);
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailError("");
  }, []);

  // Memoized static values
  const iconColor = useMemo(() => "#6B7280", []);
  const placeholderColor = useMemo(() => "#9CA3AF", []);

  if (emailSent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 pt-4 pb-8 justify-center items-center">
          {/* Success Icon - You can replace with a custom icon */}
          <View className="w-20 h-20 rounded-full bg-success-50 items-center justify-center mb-6">
            <Text className="text-4xl">✓</Text>
          </View>

          {/* Success Message */}
          <Text className="text-2xl font-inter-bold text-neutral-900 mb-3 text-center">
            Check Your Email
          </Text>
          <Text className="text-base font-inter-regular text-neutral-600 text-center mb-8 px-4">
            We've sent password reset instructions to{" "}
            <Text className="font-inter-semiBold text-neutral-900">
              {email}
            </Text>
          </Text>

          {/* Resend Email Link */}
          <View className="flex-row items-center justify-center mt-6">
            <Text className="text-base font-inter-regular text-neutral-600">
              Didn't receive the email?{" "}
            </Text>
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-base font-inter-semiBold text-primary-500">
                Resend
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 pt-4 pb-8">
          {/* Back Button Header */}
          <TouchableOpacity
            onPress={handleGoBack}
            className="mb-8 self-start"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center">
              <ArrowLeftOutlineIcon size={20} color="#374151" />
            </View>
          </TouchableOpacity>

          {/* Header Section */}
          <View className="mb-10">
            <Text className="text-4xl font-inter-bold text-primary-500 mb-3">
              Forgot Password?
            </Text>
            <Text className="text-base font-inter-regular text-neutral-600">
              No worries, we'll send you reset instructions to your email
            </Text>
          </View>

          {/* Form Section */}
          <View className="mb-6">
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
                Email <Text className="text-error-500">*</Text>
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <MailOutlineIcon size={20} color={iconColor} />
                </View>
                <TextInput
                  className={`w-full pl-12 pr-4 py-3.5 bg-neutral-50 border ${
                    emailError ? "border-error-500" : "border-neutral-200"
                  } rounded-xl font-inter-regular text-neutral-900 text-base`}
                  placeholder="Enter your email"
                  placeholderTextColor={placeholderColor}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {emailError ? (
                <Text className="text-xs font-inter-regular text-error-500 mt-1">
                  {emailError}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Reset Password Button */}
          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl mb-6 ${
              isLoading ? "bg-primary-300" : "bg-primary-500"
            } active:bg-primary-600`}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-center text-white text-base font-inter-semiBold">
                Reset Password
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
