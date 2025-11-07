import * as dotenv from "dotenv";

dotenv.config();

export default {
  expo: {
    name: "Sellio",
    slug: "sellio",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/sellio-logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      runtimeVersion: "1.0.0",
      bundleIdentifier: "com.proj.sellio",
    },
    updates: {
      url: "https://u.expo.dev/930fcd32-5538-49d4-b6c7-67c1c9681966",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/sellio-logo.png",
        backgroundColor: "#ffffff",
      },
      package: "com.proj.sellio",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
      googleServicesFile: "./google-services.json",
      edgeToEdgeEnabled: true,
      runtimeVersion: "1.0.0",
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      ["@react-native-google-signin/google-signin"],
      "expo-secure-store",
      ["expo-notifications", {}],
      [
        "expo-media-library",
        {
          isAccessMediaLocationEnabled: true,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: `Allow ${process.env.EXPO_PUBLIC_APP_NAME} to access your photos.`,
          cameraPermission: `Allow ${process.env.EXPO_PUBLIC_APP_NAME} to access your camera.`,
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: `Allow ${process.env.EXPO_PUBLIC_APP_NAME} to access your location.`,
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission: `Allow ${process.env.EXPO_PUBLIC_APP_NAME} to access your camera`,
          microphonePermission: `Allow ${process.env.EXPO_PUBLIC_APP_NAME} to access your microphone`,
          recordAudioAndroid: true,
        },
      ],

      [
        "expo-splash-screen",
        {
          image: "./assets/logo.png",
          imageWidth: 100,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],

    extra: {
      eas: {
        projectId: "930fcd32-5538-49d4-b6c7-67c1c9681966",
      },
    },
    runTimeVersion: "1.0.0",
  },
};
