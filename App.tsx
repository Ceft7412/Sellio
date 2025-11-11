import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "@expo-google-fonts/inter/useFonts";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect } from "react";
import { useAuthStore } from "./src/store/authStore";
import { QueryProvider } from "./src/providers/QueryProvider";
import MainTabs from "./src/screens/tabs/MainTabs";
import { SocketProvider } from "./src/providers/SocketProvider";
import GeneralStack from "./src/screens/general/GeneralLayout";
import AuthStack from "./src/screens/auth/AuthLayout";

const Stack = createNativeStackNavigator();

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

    // Initialize auth
    initialize();
  }, [fontsLoaded, error, initialize]);

  if (!fontsLoaded || !isInitialized) {
    return null; // Or show a splash screen
  }
  return (
    <SocketProvider userId={user?.id || ""}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <QueryProvider>
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                  }}
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
  );
}
