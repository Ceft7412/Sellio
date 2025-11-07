import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LineChart, PieChart } from "react-native-gifted-charts";

const { width } = Dimensions.get("window");

type TimeRange = "daily" | "weekly" | "monthly" | "yearly";
type DistributionTab = "status" | "category";

interface AnalyticsData {
  activeListings: number;
  pendingOffers: number;
  activeTransactions: number;
  totalViews: number;
  totalRevenue: number;
  totalSales: number;
  avgSale: number;
  salesByDate: { [key: string]: number };
  productsByStatus: {
    active: number;
    sold: number;
    draft: number;
    expired: number;
  };
  productsByCategory: {
    [key: string]: {
      name: string;
      count: number;
    };
  };
}

interface AnalyticsTabProps {
  analyticsData: AnalyticsData | undefined;
  isLoading: boolean;
}

export default function AnalyticsTab({
  analyticsData,
  isLoading,
}: AnalyticsTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [distributionTab, setDistributionTab] =
    useState<DistributionTab>("status");

  if (isLoading) {
    return (
      <View className="py-20 items-center">
        <ActivityIndicator size="large" color="#0D3F81" />
        <Text className="text-base font-inter-medium text-neutral-600 mt-4">
          Loading analytics...
        </Text>
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View className="py-20 items-center px-6">
        <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2">
          No analytics data available
        </Text>
      </View>
    );
  }

  // Prepare sales data for chart
  const salesDates = Object.keys(analyticsData.salesByDate).sort();
  const last7Days = salesDates.slice(-7);

  const lineData = last7Days.map((date, index) => ({
    value: analyticsData.salesByDate[date] || 0,
    label: new Date(date)
      .toLocaleDateString("en-US", { weekday: "short" })
      .substring(0, 3),
    dataPointText: analyticsData.salesByDate[date]?.toString() || "0",
  }));

  // Prepare product distribution data for pie chart
  const { productsByStatus, productsByCategory } = analyticsData;

  // Calculate total products for status
  const totalProducts =
    productsByStatus.active +
    productsByStatus.sold +
    productsByStatus.draft +
    productsByStatus.expired;

  // Define color palette for categories
  const categoryColors = [
    "#0D3F81", // Primary blue
    "#10B981", // Success green
    "#F59E0B", // Warning amber
    "#EF4444", // Error red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
  ];

  // Prepare pie data based on selected tab
  const pieData =
    distributionTab === "status"
      ? [
          {
            value: productsByStatus.sold,
            color: "#10B981",
            text: `${
              totalProducts > 0
                ? Math.round((productsByStatus.sold / totalProducts) * 100)
                : 0
            }%`,
          },
          {
            value: productsByStatus.active,
            color: "#0D3F81",
            text: `${
              totalProducts > 0
                ? Math.round((productsByStatus.active / totalProducts) * 100)
                : 0
            }%`,
          },
        ]
      : Object.entries(productsByCategory).map(([, category], index) => {
          const totalCategoryProducts = Object.values(
            productsByCategory
          ).reduce((sum, cat) => sum + cat.count, 0);
          return {
            value: category.count,
            color: categoryColors[index % categoryColors.length],
            text: `${
              totalCategoryProducts > 0
                ? Math.round((category.count / totalCategoryProducts) * 100)
                : 0
            }%`,
          };
        });

  const renderTimeRangeButton = (range: TimeRange, label: string) => (
    <TouchableOpacity
      key={range}
      onPress={() => setTimeRange(range)}
      className={`px-4 py-2 rounded-lg ${
        timeRange === range
          ? "bg-primary-500"
          : "bg-white border border-neutral-200"
      }`}
    >
      <Text
        className={`text-sm font-inter-medium ${
          timeRange === range ? "text-white" : "text-neutral-600"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="px-4 pt-4 pb-8">
      {/* Sales Performance Section */}
      <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <View className="flex-row items-center mb-4">
          <Text className="text-lg font-inter-bold text-neutral-900 flex-1">
            Sales Performance
          </Text>
        </View>

        {/* Time Range Selector */}
        <View className="flex-row gap-2 mb-4">
          {renderTimeRangeButton("daily", "Daily")}
          {renderTimeRangeButton("weekly", "Weekly")}
          {renderTimeRangeButton("monthly", "Monthly")}
          {renderTimeRangeButton("yearly", "Yearly")}
        </View>

        {/* Line Chart */}
        {lineData.length > 0 ? (
          <View>
            <LineChart
              data={lineData}
              width={width - 80}
              height={200}
              curved
              areaChart
              hideDataPoints={false}
              spacing={40}
              color="#0D3F81"
              thickness={3}
              startFillColor="rgba(13, 63, 129, 0.3)"
              endFillColor="rgba(13, 63, 129, 0.05)"
              startOpacity={0.9}
              endOpacity={0.2}
              initialSpacing={10}
              noOfSections={4}
              yAxisColor="#E5E7EB"
              xAxisColor="#E5E7EB"
              yAxisTextStyle={{ color: "#9CA3AF", fontSize: 10 }}
              xAxisLabelTextStyle={{ color: "#9CA3AF", fontSize: 10 }}
              dataPointsColor="#0D3F81"
              dataPointsRadius={4}
              textShiftY={-8}
              textShiftX={-5}
              textFontSize={10}
              textColor="#374151"
            />
            <Text className="text-xs font-inter-regular text-neutral-500 text-center mt-2">
              Sales data for the last 30 days
            </Text>
          </View>
        ) : (
          <View className="py-12 items-center">
            <Text className="text-sm font-inter-regular text-neutral-500">
              No sales data available
            </Text>
          </View>
        )}
      </View>

      {/* Product Distribution Section */}
      <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <View className="flex-row items-center mb-4">
          <Text className="text-lg font-inter-bold text-neutral-900 flex-1">
            Product Distribution
          </Text>
        </View>

        {/* Status/Category Tabs */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={() => setDistributionTab("status")}
            className={`px-4 py-2 rounded-lg ${
              distributionTab === "status"
                ? "bg-primary-500"
                : "bg-white border border-neutral-200"
            }`}
          >
            <Text
              className={`text-sm font-inter-medium ${
                distributionTab === "status" ? "text-white" : "text-neutral-600"
              }`}
            >
              Status
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDistributionTab("category")}
            className={`px-4 py-2 rounded-lg ${
              distributionTab === "category"
                ? "bg-primary-500"
                : "bg-white border border-neutral-200"
            }`}
          >
            <Text
              className={`text-sm font-inter-medium ${
                distributionTab === "category"
                  ? "text-white"
                  : "text-neutral-600"
              }`}
            >
              Category
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pie Chart */}
        {(distributionTab === "status" && totalProducts > 0) ||
        (distributionTab === "category" &&
          Object.keys(productsByCategory).length > 0) ? (
          <View className="items-center">
            <PieChart
              data={pieData}
              donut
              radius={100}
              innerRadius={60}
              innerCircleColor="#fff"
              centerLabelComponent={() => (
                <View>
                  <Text className="text-xs font-inter-regular text-neutral-500 text-center">
                    Total
                  </Text>
                  <Text className="text-2xl font-inter-bold text-neutral-900 text-center">
                    100%
                  </Text>
                </View>
              )}
            />

            {/* Legend */}
            <View className="mt-6 w-full">
              {distributionTab === "status" ? (
                <>
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <View className="w-4 h-4 rounded-full bg-success-500 mr-2" />
                      <Text className="text-sm font-inter-medium text-neutral-700">
                        Sold
                      </Text>
                    </View>
                    <Text className="text-lg font-inter-bold text-neutral-900">
                      {totalProducts > 0
                        ? Math.round(
                            (productsByStatus.sold / totalProducts) * 100
                          )
                        : 0}
                      %
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="w-4 h-4 rounded-full bg-primary-500 mr-2" />
                      <Text className="text-sm font-inter-medium text-neutral-700">
                        Active
                      </Text>
                    </View>
                    <Text className="text-lg font-inter-bold text-neutral-900">
                      {totalProducts > 0
                        ? Math.round(
                            (productsByStatus.active / totalProducts) * 100
                          )
                        : 0}
                      %
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  {Object.entries(productsByCategory).map(
                    ([id, category], index) => {
                      const totalCategoryProducts = Object.values(
                        productsByCategory
                      ).reduce((sum, cat) => sum + cat.count, 0);
                      const percentage =
                        totalCategoryProducts > 0
                          ? Math.round(
                              (category.count / totalCategoryProducts) * 100
                            )
                          : 0;

                      return (
                        <View
                          key={id}
                          className={`flex-row justify-between items-center ${
                            index < Object.keys(productsByCategory).length - 1
                              ? "mb-2"
                              : ""
                          }`}
                        >
                          <View className="flex-row items-center flex-1">
                            <View
                              className="w-4 h-4 rounded-full mr-2"
                              style={{
                                backgroundColor:
                                  categoryColors[index % categoryColors.length],
                              }}
                            />
                            <Text
                              className="text-sm font-inter-medium text-neutral-700"
                              numberOfLines={1}
                            >
                              {category.name}
                            </Text>
                          </View>
                          <Text className="text-lg font-inter-bold text-neutral-900 ml-2">
                            {percentage}%
                          </Text>
                        </View>
                      );
                    }
                  )}
                </>
              )}
            </View>

            <Text className="text-xs font-inter-regular text-neutral-500 text-center mt-4">
              {distributionTab === "status"
                ? "Product status breakdown showing sold, active, and inactive listings"
                : "Product category breakdown showing distribution across categories"}
            </Text>
          </View>
        ) : (
          <View className="py-12 items-center">
            <Text className="text-sm font-inter-regular text-neutral-500">
              No products to display
            </Text>
          </View>
        )}
      </View>

      {/* Performance Summary Section */}
      <View className="bg-white rounded-2xl p-4 shadow-sm">
        <Text className="text-lg font-inter-bold text-neutral-900 mb-4">
          Performance Summary
        </Text>

        {/* Total Revenue - Highlighted Card */}
        <View className="bg-primary-500 rounded-xl p-5 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-inter-semiBold text-primary-50 uppercase tracking-wide">
              Total Revenue
            </Text>
            <View className="bg-primary-600 px-2 py-1 rounded-full">
              <Text className="text-xs font-inter-bold text-white">
                {analyticsData.totalSales}{" "}
                {analyticsData.totalSales === 1 ? "sale" : "sales"}
              </Text>
            </View>
          </View>
          <Text className="text-4xl font-inter-bold text-white">
            ₱
            {analyticsData.totalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-3">
          {/* Total Sales */}
          <View className="flex-1 bg-success-50 rounded-xl p-4 border border-success-200">
            <View className="flex-row items-center mb-2">
              <Text className="text-xs font-inter-medium text-success-700">
                Total Sales
              </Text>
            </View>
            <Text className="text-3xl font-inter-bold text-success-700">
              {analyticsData.totalSales}
            </Text>
          </View>

          {/* Average Sale */}
          <View className="flex-1 bg-warning-50 rounded-xl p-4 border border-warning-200">
            <View className="flex-row items-center mb-2">
              <Text className="text-xs font-inter-medium text-warning-700">
                Avg. Sale
              </Text>
            </View>
            <Text className="text-2xl font-inter-bold text-warning-700">
              ₱
              {analyticsData.avgSale.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
