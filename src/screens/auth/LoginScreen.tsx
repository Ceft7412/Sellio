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
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";
import { MailOutlineIcon } from "../../components/icons/outline/mail-outline";
import { LockClosedOutlineIcon } from "../../components/icons/outline/lock-outline";
import { EyeOnOutlineIcon } from "../../components/icons/outline/eye-on-outline";
import { EyeOffOutlineIcon } from "../../components/icons/outline/eye-off-outline";
import { GoogleIconFilled } from "../../components/icons/fill/GoogleIconFilled";
import { useAuthStore } from "../../store/authStore";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { StackActions } from "@react-navigation/native";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  // Get login function from auth store
  const { login, isLoading } = useAuthStore();

  // Memoized email validation function
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Memoized handler functions to prevent unnecessary rerenders
  const handleLogin = useCallback(async () => {
    // Reset errors
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

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

    try {
      await login(email, password);
      Alert.alert("Success", "Logged in successfully!", [
        {
          text: "OK",
          onPress: () => {
            if (navigation.dispatch(StackActions.popToTop())) {
            }
          },
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";
      setGeneralError(errorMessage);
      Alert.alert("Login Failed", errorMessage);
    }
  }, [email, password, validateEmail, login]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsGoogleLoading(true);
    setGeneralError("");

    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Sign out first to force account selection
      await GoogleSignin.signOut();

      // Perform Google Sign-In
      const response = await GoogleSignin.signIn();

      // Check if we got an idToken
      if (!response.data?.idToken) {
        return;
      }

      // Call googleAuth from auth store with the idToken
      const { googleAuth } = useAuthStore.getState();
      await googleAuth(response.data.idToken);

      // Navigation will be handled by the root navigator based on auth state
      // If the navigation can be reset then reset
      Alert.alert("Success", "Signed in with Google successfully!", [
        {
          text: "OK",
          onPress: () => {
            if (navigation.dispatch(StackActions.popToTop())) {
            }
          },
        },
      ]);
    } catch (error: any) {
      let errorMessage = "Google Sign-In failed. Please try again.";

      // Handle specific Google Sign-In error codes
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = "Sign-in cancelled";
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = "Sign-in already in progress";
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = "Google Play Services not available";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setGeneralError(errorMessage);
      Alert.alert("Google Sign-In Failed", errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  }, []);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate("forgotPassword");
  }, [navigation]);

  const handleSignUp = useCallback(() => {
    navigation.navigate("register");
  }, [navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  // Memoized input change handlers
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailError("");
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setPasswordError("");
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Memoized static values
  const iconColor = useMemo(() => "#6B7280", []);
  const placeholderColor = useMemo(() => "#9CA3AF", []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
                Welcome Back
              </Text>
              <Text className="text-base font-inter-regular text-neutral-600">
                Sign in to continue to Sellio
              </Text>
            </View>

            {/* Form Section */}
            <View className="mb-6">
              {/* General Error Message */}
              {generalError ? (
                <View className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                  <Text className="text-sm font-inter-regular text-error-700">
                    {generalError}
                  </Text>
                </View>
              ) : null}

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
                  Email
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

              {/* Password Input */}
              <View className="mb-2">
                <Text className="text-sm font-inter-medium text-neutral-700 mb-2">
                  Password
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <LockClosedOutlineIcon size={20} color={iconColor} />
                  </View>
                  <TextInput
                    className={`w-full pl-12 pr-12 py-3.5 bg-neutral-50 border ${
                      passwordError ? "border-error-500" : "border-neutral-200"
                    } rounded-xl font-inter-regular text-neutral-900 text-base`}
                    placeholder="Enter your password"
                    placeholderTextColor={placeholderColor}
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={toggleShowPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOffOutlineIcon size={20} color={iconColor} />
                    ) : (
                      <EyeOnOutlineIcon size={20} color={iconColor} />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text className="text-xs font-inter-regular text-error-500 mt-1">
                    {passwordError}
                  </Text>
                ) : null}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                className="self-end py-2"
              >
                <Text className="text-sm font-inter-medium text-primary-500">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl mb-6 ${
                isLoading ? "bg-primary-300" : "bg-primary-500"
              } active:bg-primary-600`}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-center text-white text-base font-inter-semiBold">
                  Log In
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

            {/* Google Sign-In Button */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-4 rounded-xl border-2 border-neutral-200 bg-white mb-8 flex-row items-center justify-center active:bg-neutral-50"
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#0D3F81" />
              ) : (
                <>
                  <GoogleIconFilled width={20} height={20} color="#4285F4" />
                  <Text className="ml-3 text-base font-inter-semiBold text-neutral-700">
                    Sign in with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row items-center justify-center">
              <Text className="text-base font-inter-regular text-neutral-600">
                Not registered yet?{" "}
              </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text className="text-base font-inter-semiBold text-primary-500">
                  Sign up now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
