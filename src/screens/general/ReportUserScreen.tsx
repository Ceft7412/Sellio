import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { reportsAPI } from "../../constants/axios";
import { ChevronLeftRegularIcon } from "../../components/icons/outline/chevron-left";
import { ChevronRightRegularIcon } from "../../components/icons/outline/chevron-outline";

interface ReportOption {
  id: string;
  title: string;
  description?: string;
  subOptions?: ReportOption[];
}

const reportCategories: ReportOption[] = [
  {
    id: "item_issue",
    title: "Item Not as Described",
    description: "Product doesn't match the listing",
    subOptions: [
      {
        id: "wrong_item",
        title: "Wrong Item Received",
        description: "Received a completely different item",
      },
      {
        id: "fake_counterfeit",
        title: "Fake or Counterfeit",
        description: "Item is not authentic or genuine",
      },
      {
        id: "missing_parts",
        title: "Missing Parts or Accessories",
        description: "Item incomplete or missing components",
      },
      {
        id: "condition_mismatch",
        title: "Condition Not as Described",
        description: "Item condition worse than listed",
      },
    ],
  },
  {
    id: "no_delivery",
    title: "Didn't Receive Item",
    description: "Item was never delivered",
    subOptions: [
      {
        id: "no_show",
        title: "Didn't Show Up to Meetup",
        description: "Other party didn't come to agreed location",
      },
      {
        id: "cancelled_last_minute",
        title: "Cancelled Last Minute",
        description: "Cancelled the meeting without notice",
      },
      {
        id: "never_delivered",
        title: "Never Delivered the Item",
        description: "Agreed to meet but didn't bring the item",
      },
    ],
  },
  {
    id: "damaged_defective",
    title: "Damaged or Defective",
    description: "Item has problems or damage",
    subOptions: [
      {
        id: "physical_damage",
        title: "Physical Damage",
        description: "Item is broken, cracked, or damaged",
      },
      {
        id: "not_working",
        title: "Not Working Properly",
        description: "Item doesn't function as expected",
      },
      {
        id: "hidden_defects",
        title: "Hidden Defects",
        description: "Problems not disclosed in listing",
      },
    ],
  },
  {
    id: "payment_issue",
    title: "Payment Problem",
    description: "Issues with payment or pricing",
    subOptions: [
      {
        id: "wrong_price",
        title: "Charged Wrong Amount",
        description: "Price different from agreed amount",
      },
      {
        id: "payment_fraud",
        title: "Payment Scam",
        description: "Requested payment outside platform",
      },
      {
        id: "no_refund",
        title: "Refused to Refund",
        description: "Won't return money for problematic item",
      },
    ],
  },
  {
    id: "safety_concern",
    title: "Safety or Security Concern",
    description: "Felt unsafe during transaction",
    subOptions: [
      {
        id: "unsafe_location",
        title: "Unsafe Meetup Location",
        description: "Insisted on dangerous or isolated location",
      },
      {
        id: "threatening_behavior",
        title: "Threatening or Aggressive",
        description: "Acted in a threatening manner",
      },
      {
        id: "suspicious_activity",
        title: "Suspicious Activity",
        description: "Behavior seemed suspicious or dangerous",
      },
    ],
  },
  {
    id: "unprofessional",
    title: "Unprofessional Conduct",
    description: "Poor behavior during transaction",
    subOptions: [
      {
        id: "rude_disrespectful",
        title: "Rude or Disrespectful",
        description: "Treated me poorly or unprofessionally",
      },
      {
        id: "poor_communication",
        title: "Poor Communication",
        description: "Unresponsive or gave misleading info",
      },
      {
        id: "pressure_tactics",
        title: "Pressure or Harassment",
        description: "Used aggressive sales or buying tactics",
      },
    ],
  },
  {
    id: "other",
    title: "Something Else",
    description: "Other transaction issues",
    subOptions: [
      {
        id: "violated_terms",
        title: "Violated Platform Terms",
        description: "Broke Sellio's rules or guidelines",
      },
      {
        id: "privacy_concern",
        title: "Privacy Concern",
        description: "Shared my personal information",
      },
      {
        id: "other_reason",
        title: "Other Reason",
        description: "Something not listed here",
      },
    ],
  },
];

type ReportStep = "category" | "subcategory" | "details";

export default function ReportUserScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const {
    reportedUserId,
    reportedUserName,
    productId,
    transactionId,
    conversationId,
    userRole,
  } = route.params || {};

  const [currentStep, setCurrentStep] = useState<ReportStep>("category");
  const [selectedCategory, setSelectedCategory] = useState<ReportOption | null>(
    null
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<ReportOption | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState("");

  // Filter categories based on user role
  const filteredCategories = reportCategories.filter((category) => {
    // Categories available to buyers (reporting sellers)
    const buyerCategories = [
      "item_issue", // Item not as described
      "no_delivery", // Didn't receive item
      "damaged_defective", // Damaged or defective
      "safety_concern", // Safety concerns
      "unprofessional", // Unprofessional conduct
      "other", // Other issues
    ];

    // Categories available to sellers (reporting buyers)
    const sellerCategories = [
      "no_delivery", // Buyer didn't show up
      "payment_issue", // Payment problems
      "safety_concern", // Safety concerns
      "unprofessional", // Unprofessional conduct
      "other", // Other issues
    ];

    if (userRole === "buyer") {
      return buyerCategories.includes(category.id);
    } else if (userRole === "seller") {
      return sellerCategories.includes(category.id);
    }

    // Default: show all if role is not specified
    return true;
  });

  const submitReportMutation = useMutation({
    mutationFn: (data: {
      reportedUserId: string;
      productId: string;
      transactionId: string;
      reportType: string;
      details?: string;
      conversationId: string;
    }) => reportsAPI.submitReport(data),
    onSuccess: () => {
      Alert.alert(
        "Report Submitted",
        "Thank you for your report. We will review it and take appropriate action.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to submit report"
      );
    },
  });

  const handleBack = () => {
    if (currentStep === "subcategory") {
      setCurrentStep("category");
      setSelectedSubcategory(null);
    } else if (currentStep === "details") {
      setCurrentStep("subcategory");
      setAdditionalDetails("");
    } else {
      navigation.goBack();
    }
  };

  const handleCategorySelect = (category: ReportOption) => {
    setSelectedCategory(category);
    setCurrentStep("subcategory");
  };

  const handleSubcategorySelect = (subcategory: ReportOption) => {
    setSelectedSubcategory(subcategory);
    setCurrentStep("details");
  };

  const handleSubmit = () => {
    if (!selectedSubcategory) return;

    submitReportMutation.mutate({
      reportedUserId,
      productId,
      transactionId,
      reportType: selectedSubcategory.id,
      details: additionalDetails.trim() || undefined,
      conversationId,
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4 border-b border-neutral-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full items-center justify-center bg-neutral-100 mr-3"
          >
            <ChevronLeftRegularIcon size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-inter-bold text-neutral-900">
              Report User
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-600 mt-0.5">
              {reportedUserName || "User"}
            </Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View className="flex-row items-center mt-4 space-x-2">
          <View
            className={`flex-1 h-1 rounded-full ${
              currentStep === "category" ? "bg-primary-500" : "bg-neutral-200"
            }`}
          />
          <View
            className={`flex-1 h-1 rounded-full ${
              currentStep === "subcategory" || currentStep === "details"
                ? "bg-primary-500"
                : "bg-neutral-200"
            }`}
          />
          <View
            className={`flex-1 h-1 rounded-full ${
              currentStep === "details" ? "bg-primary-500" : "bg-neutral-200"
            }`}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Step 1: Category Selection */}
        {currentStep === "category" && (
          <View>
            <Text className="text-base font-inter-semiBold text-neutral-900 mb-2">
              What went wrong?
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-600 mb-4">
              Select the issue that best describes your problem
            </Text>

            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategorySelect(category)}
                className="mb-3 p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex-row items-center"
              >
                <View className="flex-1">
                  <Text className="text-base font-inter-semiBold text-neutral-900 mb-1">
                    {category.title}
                  </Text>
                  {category.description && (
                    <Text className="text-sm font-inter-regular text-neutral-600">
                      {category.description}
                    </Text>
                  )}
                </View>
                <ChevronRightRegularIcon size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Subcategory Selection */}
        {currentStep === "subcategory" && selectedCategory && (
          <View>
            <Text className="text-base font-inter-semiBold text-neutral-900 mb-2">
              Tell us more
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-600 mb-4">
              Select the specific issue
            </Text>

            {selectedCategory.subOptions?.map((subcategory) => (
              <TouchableOpacity
                key={subcategory.id}
                onPress={() => handleSubcategorySelect(subcategory)}
                className="mb-3 p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex-row items-center"
              >
                <View className="flex-1">
                  <Text className="text-base font-inter-semiBold text-neutral-900 mb-1">
                    {subcategory.title}
                  </Text>
                  {subcategory.description && (
                    <Text className="text-sm font-inter-regular text-neutral-600">
                      {subcategory.description}
                    </Text>
                  )}
                </View>
                <ChevronRightRegularIcon size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 3: Additional Details */}
        {currentStep === "details" && selectedSubcategory && (
          <View>
            <Text className="text-base font-inter-semiBold text-neutral-900 mb-2">
              Additional details (Optional)
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-600 mb-4">
              Provide any additional information that might help us understand
              the issue better
            </Text>

            {/* Selected Issue Summary */}
            <View className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-xl">
              <Text className="text-xs font-inter-medium text-primary-700 mb-2">
                REPORTING FOR
              </Text>
              <Text className="text-base font-inter-semiBold text-primary-900 mb-1">
                {selectedSubcategory.title}
              </Text>
              {selectedSubcategory.description && (
                <Text className="text-sm font-inter-regular text-primary-700">
                  {selectedSubcategory.description}
                </Text>
              )}
            </View>

            {/* Text Input */}
            <TextInput
              value={additionalDetails}
              onChangeText={setAdditionalDetails}
              placeholder="Describe what happened (optional)..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-base font-inter-regular text-neutral-900 mb-6"
              style={{ minHeight: 120 }}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitReportMutation.isPending}
              className={`py-4 rounded-xl items-center mb-4 ${
                submitReportMutation.isPending
                  ? "bg-primary-300"
                  : "bg-primary-500"
              }`}
            >
              {submitReportMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-base font-inter-semiBold text-white">
                  Submit Report
                </Text>
              )}
            </TouchableOpacity>

            <Text className="text-xs font-inter-regular text-neutral-500 text-center mb-6">
              False reports may result in account restrictions
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
