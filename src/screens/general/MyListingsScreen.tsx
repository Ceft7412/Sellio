import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeftRegularIcon } from "../../components/icons/outline/chevron-left";
import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "../../constants/axios";
import { LineChart, PieChart } from "react-native-gifted-charts";

const { width } = Dimensions.get("window");

// Tab components will be defined below
import ListingsTab from "../../components/mylisting/ListingsTab";
import OffersTab from "../../components/mylisting/OffersTab";
import SalesTab from "../../components/mylisting/SalesTab";
import AnalyticsTab from "../../components/mylisting/AnalyticsTab";

type TabType = "listings" | "offers" | "sales" | "analytics";

export default function MyListingsScreen({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState<TabType>("listings");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics data for the header stats
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["sellerAnalytics"],
    queryFn: async () => {
      const response = await productsAPI.getSellerAnalytics();
      return response.data.analytics;
    },
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchAnalytics();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [refetchAnalytics]);

  const handleBack = () => {
    navigation.goBack();
  };

  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      key={tab}
      onPress={() => setActiveTab(tab)}
      className={`flex-1 py-3 border-b-2 ${
        activeTab === tab ? "border-primary-500" : "border-transparent"
      }`}
    >
      <Text
        className={`text-center text-sm font-inter-semiBold ${
          activeTab === tab ? "text-primary-500" : "text-neutral-500"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "listings":
        return <ListingsTab navigation={navigation} />;
      case "offers":
        return <OffersTab navigation={navigation} />;
      case "sales":
        return <SalesTab navigation={navigation} />;
      case "analytics":
        return (
          <AnalyticsTab
            analyticsData={analyticsData}
            isLoading={analyticsLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 border-b border-neutral-100">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 mr-3"
          >
            <ChevronLeftRegularIcon size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-inter-bold text-neutral-900 flex-1">
            My Listings
          </Text>
        </View>

        {/* Stats Summary */}
        {analyticsLoading ? (
          <View className="py-4">
            <ActivityIndicator size="small" color="#0D3F81" />
          </View>
        ) : analyticsData ? (
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-inter-bold text-primary-500">
                {analyticsData.activeListings}
              </Text>
              <Text className="text-xs text-center font-inter-regular text-neutral-500 mt-1">
                Active{"\n"} Listings
              </Text>
            </View>
            <View className="flex-1 items-center border-l border-r border-neutral-200">
              <Text className="text-2xl font-inter-bold text-warning-500">
                {analyticsData.pendingOffers}
              </Text>
              <Text className="text-xs text-center font-inter-regular text-neutral-500 mt-1">
                Pending{"\n"} Offers
              </Text>
            </View>
            <View className="flex-1 items-center border-r border-neutral-200">
              <Text className="text-2xl font-inter-bold text-success-500">
                {analyticsData.activeTransactions}
              </Text>
              <Text className="text-xs text-center font-inter-regular text-neutral-500 mt-1">
                Active Transaction
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-inter-bold text-neutral-700">
                {analyticsData.totalViews}
              </Text>
              <Text className="text-xs text-center font-inter-regular text-neutral-500 mt-1">
                Total{"\n"} Views
              </Text>
            </View>
          </View>
        ) : null}

        {/* Tabs */}
        <View className="flex-row   border-neutral-200">
          {renderTabButton("listings", "Listings")}
          {renderTabButton("sales", "Sales")}
          {renderTabButton("analytics", "Analytics")}
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0D3F81"]}
            tintColor="#0D3F81"
          />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}
