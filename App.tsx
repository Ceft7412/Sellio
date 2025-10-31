import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/tabs/HomeScreen";
import CategoryScreen from "./src/screens/tabs/CategoryScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import { useFonts } from "@expo-google-fonts/inter/useFonts";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as NavigationBar from "expo-navigation-bar";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import { useEffect } from "react";
import TermsOfServiceScreen from "./src/screens/general/TermsOfServiceScreen";
import PrivacyPolicyScreen from "./src/screens/general/PrivacyPolicyScreen";
import { useAuthStore } from "./src/store/authStore";
import { QueryProvider } from "./src/providers/QueryProvider";
import MainTabs from "./src/screens/tabs/MainTabs";
import ProductDetailsScreen from "./src/screens/general/ProductDetailsScreen";
import EditProfileScreen from "./src/screens/general/EditProfileScreen";
import ConversationsScreen from "./src/screens/general/ConversationsScreen";
import FavoritesScreen from "./src/screens/general/FavoritesScreen";
import CreateProduct from "./src/screens/general/CreateProduct";
import ChatScreen from "./src/screens/general/ChatScreen";
import IdentityVerificationScreen from "./src/screens/general/IdentityVerificationScreen";
import { SocketProvider } from "./src/providers/SocketProvider";
import MapMarkedLocation from "./src/screens/general/MapMarkedLocation";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="register" component={RegisterScreen} />
      <Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function GeneralStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="privacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="termsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="productDetail" component={ProductDetailsScreen} />
      <Stack.Screen name="editProfile" component={EditProfileScreen} />
      <Stack.Screen name="conversations" component={ConversationsScreen} />
      <Stack.Screen name="chat" component={ChatScreen} />
      <Stack.Screen name="favorites" component={FavoritesScreen} />
      <Stack.Screen name="createProduct" component={CreateProduct} />
      <Stack.Screen
        name="identityVerification"
        component={IdentityVerificationScreen}
      />
      <Stack.Screen name="mapMarkedLocation" component={MapMarkedLocation} />
    </Stack.Navigator>
  );
}

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);

  const [fontsLoaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
    // Configure Google Sign In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      offlineAccess: true,
    });

    // Initialize auth store
    initialize();

    if (fontsLoaded) {
      console.log("Fonts loaded");
    }
  }, [fontsLoaded, error, initialize]);

  if (!fontsLoaded || !isInitialized) {
    return null; // Or show a splash screen
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="white" />
      <SocketProvider userId={user?.id || ""}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <BottomSheetModalProvider>
              <QueryProvider>
                <NavigationContainer>
                  <Stack.Navigator
                    screenOptions={{ headerShown: false }}
                    initialRouteName={user ? "main" : "main"}
                  >
                    <Stack.Screen name="auth" component={AuthStack} />

                    <Stack.Screen name="main" component={MainTabs} />
                    <Stack.Screen name="general" component={GeneralStack} />
                  </Stack.Navigator>
                </NavigationContainer>
              </QueryProvider>
            </BottomSheetModalProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SocketProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
