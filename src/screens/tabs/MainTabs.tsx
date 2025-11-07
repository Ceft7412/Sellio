import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useRef } from "react";
import { Alert, StatusBar } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import HomeScreen from "./HomeScreen";
import { HomeFilledIcon } from "../../components/icons/fill/home-fill";
import { HomeOutlineIcon } from "../../components/icons/outline/home-outline";
import CategoryScreen from "./CategoryScreen";
import { GridFilledIcon } from "../../components/icons/fill/grid-fill";
import { GridRegularIcon } from "../../components/icons/outline/grid-outline";
import SellScreen from "./SellScreen";
import { AddCircleRegularIcon } from "../../components/icons/outline/add-outline";
import NotificationScreen from "./NotificationScreen";
import { AlertFilledIcon } from "../../components/icons/fill/bell-fill";
import { AlertRegularIcon } from "../../components/icons/outline/bell-outline";
import AccountScreen from "./AccountScreen";
import { PersonFilledIcon } from "../../components/icons/fill/person-fill";
import { PersonOutlineIcon } from "../../components/icons/outline/person-outline";
import { useAuthStore } from "../../store/authStore";
import SellBottomSheet from "../../components/bottomsheets/SellBottomSheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export default function MainTabs({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const sellBottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  // Handle Sell tab press
  const handleSellTabPress = (e: any) => {
    // Prevent default navigation
    e.preventDefault();

    if (!user) {
      // If not logged in, redirect to login
      navigation.navigate("auth", { screen: "login" } as never);
      return;
    }
    // Check if user is identity verified
    if (user?.identityVerified) {
      // User is verified, show the sell bottom sheet
      sellBottomSheetRef.current?.present();
    } else {
      // User is not verified, show alert
      Alert.alert(
        "Identity Verification Required",
        "You need to verify your identity before you can sell items on Sellio. Would you like to start the verification process?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Verify Now",
            onPress: () => {
              navigation.navigate("main", { screen: "Account" } as never);
            },
          },
        ]
      );
    }
  };

  const handleNotificationTabPress = (e: any) => {
    // Redirect to account if not logged in
    if (!user) {
      e.preventDefault();
      navigation.navigate("auth", { screen: "login" } as never);
    }
  };

  // Handle category selection from bottom sheet
  const handleCategorySelect = (category: any) => {
    // Navigate to create product screen with selected category
    navigation.navigate("general", {
      screen: "createProduct",
      params: { selectedCategory: category },
    } as never);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={"#fff"} />
      <Tab.Navigator
        screenOptions={{
          sceneStyle: { backgroundColor: "white" },
          headerShown: false,
          tabBarStyle: {
            height: insets.bottom + 50,
            paddingBottom: 5,
          },
          tabBarLabelStyle: {
            fontFamily: "Inter_600SemiBold",
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) =>
              focused ? (
                <HomeFilledIcon color={color} size={24} />
              ) : (
                <HomeOutlineIcon color={color} size={24} />
              ),

            tabBarActiveTintColor: "#0D3F81",
            tabBarInactiveTintColor: "#374151",
          }}
        />
        <Tab.Screen
          name="Category"
          component={CategoryScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) =>
              focused ? (
                <GridFilledIcon color={color} size={24} />
              ) : (
                <GridRegularIcon color={color} size={24} />
              ),

            tabBarActiveTintColor: "#0D3F81",
            tabBarInactiveTintColor: "#374151",
          }}
        />
        <Tab.Screen
          name="Sell"
          component={SellScreen}
          listeners={{
            tabPress: handleSellTabPress,
          }}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) =>
              focused ? (
                <AddCircleRegularIcon color={color} size={24} />
              ) : (
                <AddCircleRegularIcon color={color} size={24} />
              ),

            tabBarActiveTintColor: "#0D3F81",
            tabBarInactiveTintColor: "#374151",
          }}
        />
        <Tab.Screen
          name="Notification"
          component={NotificationScreen}
          listeners={{
            tabPress: handleNotificationTabPress,
          }}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) =>
              focused ? (
                <AlertFilledIcon color={color} size={24} />
              ) : (
                <AlertRegularIcon color={color} size={24} />
              ),

            tabBarActiveTintColor: "#0D3F81",
            tabBarInactiveTintColor: "#374151",
          }}
        />
        <Tab.Screen
          name="Account"
          component={AccountScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) =>
              focused ? (
                <PersonFilledIcon color={color} size={24} />
              ) : (
                <PersonOutlineIcon color={color} size={24} />
              ),

            tabBarActiveTintColor: "#0D3F81",
            tabBarInactiveTintColor: "#374151",
          }}
        />
      </Tab.Navigator>

      {/* Sell Bottom Sheet - Only shown when user taps Sell tab and is verified */}
      <SellBottomSheet
        ref={sellBottomSheetRef}
        onCategorySelect={handleCategorySelect}
      />
    </>
  );
}
