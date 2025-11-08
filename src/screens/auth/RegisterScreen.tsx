import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";
import { MailOutlineIcon } from "../../components/icons/outline/mail-outline";
import { LockClosedOutlineIcon } from "../../components/icons/outline/lock-outline";
import { PersonOutlineIcon } from "../../components/icons/outline/person-outline";
import { EyeOnOutlineIcon } from "../../components/icons/outline/eye-on-outline";
import { EyeOffOutlineIcon } from "../../components/icons/outline/eye-off-outline";
import { GoogleIconFilled } from "../../components/icons/fill/GoogleIconFilled";
import { useAuthStore } from "../../store/authStore";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { StackActions } from "@react-navigation/native";

export default function RegisterScreen({ navigation }: any) {
  const register = useAuthStore((state) => state.register);
  const authLoading = useAuthStore((state) => state.isLoading);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Memoized email validation function
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Memoized handler functions to prevent unnecessary rerenders
  const handleRegister = useCallback(async () => {
    // Reset errors
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // Validate name
    if (!name.trim()) {
      setNameError("Full name is required");
      return;
    }

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    try {
      // Call register from auth store
      const response = await register(email, password, name);

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Show success message
      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => {
            if (navigation.dispatch(StackActions.popToTop())) {
            }
          },
        },
      ]);
    } catch (error: any) {
      // Show error message
      Alert.alert(
        "Registration Failed",
        error.message || "Something went wrong. Please try again."
      );
    }
  }, [name, email, password, confirmPassword, validateEmail, register]);

  const handleGoogleSignUp = useCallback(async () => {
    setIsGoogleLoading(true);

    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Sign out first to force account selection
      await GoogleSignin.signOut();

      // Perform Google Sign-In
      const response = await GoogleSignin.signIn();

      // Check if we got an idToken
      if (!response.data?.idToken) {
        throw new Error("Failed to get ID token from Google");
      }

      // Call googleAuth from auth store with the idToken
      const { googleAuth } = useAuthStore.getState();
      await googleAuth(response.data.idToken);

      // Show success message and navigate
      Alert.alert("Success", "Account created with Google successfully!", [
        {
          text: "OK",
          onPress: () => {
            if (navigation.dispatch(StackActions.popToTop())) {
            }
          },
        },
      ]);
    } catch (error: any) {
      let errorMessage = "Google Sign-Up failed. Please try again.";

      // Handle specific Google Sign-In error codes
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = "Sign-up cancelled";
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = "Sign-up already in progress";
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = "Google Play Services not available";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Google Sign-Up Failed", errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  }, []);

  const handleSignIn = useCallback(() => {
    navigation.navigate("login");
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Memoized input change handlers
  const handleNameChange = useCallback((text: string) => {
    setName(text);
    setNameError("");
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailError("");
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setPasswordError("");
  }, []);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError("");
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  // Memoized static values
  const iconColor = useMemo(() => "#6B7280", []);
  const placeholderColor = useMemo(() => "#9CA3AF", []);

  return (
    <View className="flex-1 bg-white">
      <KeyboardAwareScrollView>
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
          <View className="mb-8">
            <Text className="text-4xl font-inter-bold text-primary-500 mb-3">
              Create Account
            </Text>
            <Text className="text-base font-inter-regular text-neutral-600">
              Sign up to get started with Sellio
            </Text>
          </View>

          {/* Form Section */}
          <View className="mb-6">
            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
                Full Name <Text className="text-error-500">*</Text>
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <PersonOutlineIcon size={20} color={iconColor} />
                </View>
                <TextInput
                  className={`w-full pl-12 pr-4 py-3.5 bg-neutral-50 border ${
                    nameError ? "border-error-500" : "border-neutral-200"
                  } rounded-xl font-inter-regular text-neutral-900 text-base`}
                  placeholder="Enter your full name"
                  placeholderTextColor={placeholderColor}
                  value={name}
                  onChangeText={handleNameChange}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
              {nameError ? (
                <Text className="text-xs font-inter-regular text-error-500 mt-1">
                  {nameError}
                </Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
                Email <Text className="text-error-500">*</Text>
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <MailOutlineIcon size={20} color="#6B7280" />
                </View>
                <TextInput
                  className={`w-full pl-12 pr-4 py-3.5 bg-neutral-50 border ${
                    emailError ? "border-error-500" : "border-neutral-200"
                  } rounded-xl font-inter-regular text-neutral-900 text-base`}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
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

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
                Password <Text className="text-error-500">*</Text>
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <LockClosedOutlineIcon size={20} color="#6B7280" />
                </View>
                <TextInput
                  className={`w-full pl-12 pr-12 py-3.5 bg-neutral-50 border ${
                    passwordError ? "border-error-500" : "border-neutral-200"
                  } rounded-xl font-inter-regular text-neutral-900 text-base`}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  onPress={toggleShowPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOffOutlineIcon size={20} color="#6B7280" />
                  ) : (
                    <EyeOnOutlineIcon size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text className="text-xs font-inter-regular text-error-500 mt-1">
                  {passwordError}
                </Text>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
                Confirm Password <Text className="text-error-500">*</Text>
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <LockClosedOutlineIcon size={20} color="#6B7280" />
                </View>
                <TextInput
                  className={`w-full pl-12 pr-12 py-3.5 bg-neutral-50 border ${
                    confirmPasswordError
                      ? "border-error-500"
                      : "border-neutral-200"
                  } rounded-xl font-inter-regular text-neutral-900 text-base`}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  onPress={toggleShowConfirmPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  activeOpacity={0.7}
                >
                  {showConfirmPassword ? (
                    <EyeOffOutlineIcon size={20} color="#6B7280" />
                  ) : (
                    <EyeOnOutlineIcon size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text className="text-xs font-inter-regular text-error-500 mt-1">
                  {confirmPasswordError}
                </Text>
              ) : null}
            </View>

            {/* Terms and Conditions */}
            <View className="mb-2">
              <Text className="text-xs font-inter-regular text-neutral-600 text-center">
                By signing up, you agree to our{" "}
                <Text
                  className="text-primary-500 font-inter-medium"
                  onPress={() =>
                    navigation.navigate("general", {
                      screen: "termsOfService",
                    })
                  }
                >
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text
                  className="text-primary-500 font-inter-medium"
                  onPress={() =>
                    navigation.navigate("general", {
                      screen: "privacyPolicy",
                    })
                  }
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={authLoading}
            className={`w-full py-4 rounded-xl mb-6 ${
              authLoading ? "bg-primary-300" : "bg-primary-500"
            } active:bg-primary-600`}
          >
            {authLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-center text-white text-base font-inter-semiBold">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-neutral-200" />
            <Text className="mx-4 text-sm font-inter-regular text-neutral-500">
              or continue with
            </Text>
            <View className="flex-1 h-px bg-neutral-200" />
          </View>

          {/* Google Sign-Up Button */}
          <TouchableOpacity
            onPress={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full py-4 rounded-xl border-2 border-neutral-200 bg-white mb-8 flex-row items-center justify-center active:bg-neutral-50"
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#0D3F81" />
            ) : (
              <>
                <GoogleIconFilled width={20} height={20} color="#4285F4" />
                <Text className="ml-3 text-base font-inter-semiBold text-neutral-700">
                  Sign up with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row items-center justify-center">
            <Text className="text-base font-inter-regular text-neutral-600">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text className="text-base font-inter-semiBold text-primary-500">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
