import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import PrivacyPolicyScreen from "./PrivacyPolicyScreen";
import TermsOfServiceScreen from "./TermsOfServiceScreen";
import ProductDetailsScreen from "./ProductDetailsScreen";
import EditProfileScreen from "./EditProfileScreen";
import ConversationsScreen from "./ConversationsScreen";
import ChatScreen from "./ChatScreen";
import FavoritesScreen from "./FavoritesScreen";
import CreateProduct from "./CreateProduct";
import IdentityVerificationScreen from "./IdentityVerificationScreen";
import MapMarkedLocation from "./MapMarkedLocation";
import ReportUserScreen from "./ReportUserScreen";
import CategoryProductsScreen from "./CategoryProductsScreen";
import SearchScreen from "./SearchScreen";
import MyPurchasesScreen from "./MyPurchasesScreen";
import MyListingsScreen from "./MyListingsScreen";
import ReviewScreen from "./ReviewScreen";
import UserProfileScreen from "./UserProfileScreen";
import ImageViewerScreen from "./ImageViewerScreen";
import SettingsScreen from "./SettingsScreen";
import AboutScreen from "./AboutScreen";
import HelpSupportScreen from "./HelpSupportScreen";

const Stack = createNativeStackNavigator();

export default function GeneralStack() {
  return (
    <SafeAreaView className="flex-1 bg-white">
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
        <Stack.Screen name="reportUser" component={ReportUserScreen} />
        <Stack.Screen
          name="categoryProducts"
          component={CategoryProductsScreen}
        />
        <Stack.Screen name="search" component={SearchScreen} />
        <Stack.Screen name="myPurchases" component={MyPurchasesScreen} />
        <Stack.Screen name="myListings" component={MyListingsScreen} />
        <Stack.Screen name="review" component={ReviewScreen} />
        <Stack.Screen name="userProfile" component={UserProfileScreen} />
        <Stack.Screen name="imageViewer" component={ImageViewerScreen} />
        <Stack.Screen name="settings" component={SettingsScreen} />
        <Stack.Screen name="about" component={AboutScreen} />
        <Stack.Screen name="help" component={HelpSupportScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
}
