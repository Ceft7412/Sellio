import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeftOutlineIcon } from "../../components/icons/outline/arrow-left-outline";
import { ChatRegularIcon } from "../../components/icons/outline/chat-outline";
import { ChevronDownRegularIcon } from "../../components/icons/outline/chevron-down-outline";
import { MailOutlineIcon } from "../../components/icons/outline/mail-outline";
import { CallRegularIcon } from "../../components/icons/outline/call-outline";

const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqs = [
    {
      id: "1",
      question: "How do I list a product for sale?",
      answer:
        'Tap the "Sell" button at the bottom of the screen, select a category, fill in the product details including photos, price, and description, then submit your listing for review.',
    },
    {
      id: "2",
      question: "What is the auction feature?",
      answer:
        "Auctions allow sellers to list items that buyers can bid on. The highest bidder when the auction ends wins the item. Set a starting price, minimum bid increment, and auction end time when listing.",
    },
    {
      id: "3",
      question: "How does blockchain verification work?",
      answer:
        "All transactions on Sellio are recorded on the blockchain, providing a transparent and immutable record of product ownership and transaction history. This helps prevent fraud and ensures authenticity.",
    },
    {
      id: "4",
      question: "How do I become a verified seller?",
      answer:
        "Go to your profile, tap on seller settings, and submit your verification documents. Verified sellers gain trust and visibility.",
    },
    {
      id: "5",
      question: "What payment methods are accepted?",
      answer:
        "Buyers and sellers can arrange payment through the chat feature. Common methods include bank transfer, mobile wallets, and cash on delivery. Always use secure payment methods.",
    },
    {
      id: "6",
      question: "How do I report a suspicious listing?",
      answer:
        "Tap the three dots on any product listing and select 'Report'. Choose the reason for reporting and our team will investigate within 24 hours.",
    },
    {
      id: "7",
      question: "Can I edit my listing after posting?",
      answer:
        "Yes, go to your profile, tap on 'My Listings', select the product you want to edit, and tap the edit icon. You can update details, photos, and price at any time.",
    },
    {
      id: "8",
      question: "What should I do if I haven't received my item?",
      answer:
        "Contact the seller through the chat feature first. If unresolved, report the issue with your order details and screenshots.",
    },
  ];

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleContactSupport = (type: "email" | "phone" | "chat") => {
    switch (type) {
      case "email":
        Linking.openURL("mailto:support@sellio.com");
        break;
      case "phone":
        Linking.openURL("tel:+1234567890");
        break;
      case "chat":
        // Navigate to support chat or open messaging
        break;
    }
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-white border-b border-neutral-200 px-6 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 w-10 h-10 items-center justify-center"
          >
            <ArrowLeftOutlineIcon size={24} color="#171717" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-inter-bold text-neutral-900">
              Help & Support
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-500 mt-0.5">
              Get answers to your questions
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Contact Support Section */}
        <View className="bg-white px-6 py-4 mb-2">
          <Text className="text-lg font-inter-bold text-neutral-900 mb-3">
            Contact Support
          </Text>
          <Text className="text-sm font-inter-regular text-neutral-600 mb-4">
            Need help? Our support team is here for you
          </Text>

          {/* Contact Options */}
          <View className="gap-3">
            {/* Email */}
            <TouchableOpacity
              onPress={() => handleContactSupport("email")}
              className="flex-row items-center p-4 bg-neutral-50 rounded-xl border border-neutral-200"
            >
              <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
                <MailOutlineIcon size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-inter-semiBold text-neutral-900">
                  Email Support
                </Text>
                <Text className="text-sm font-inter-regular text-neutral-500 mt-0.5">
                  support@sellio.com
                </Text>
              </View>
              <ChevronDownRegularIcon
                size={20}
                color="#9CA3AF"
                style={{ transform: [{ rotate: "-90deg" }] }}
              />
            </TouchableOpacity>

            {/* Phone */}
            <TouchableOpacity
              onPress={() => handleContactSupport("phone")}
              className="flex-row items-center p-4 bg-neutral-50 rounded-xl border border-neutral-200"
            >
              <View className="w-10 h-10 rounded-full bg-success-100 items-center justify-center mr-3">
                <CallRegularIcon size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-inter-semiBold text-neutral-900">
                  Phone Support
                </Text>
                <Text className="text-sm font-inter-regular text-neutral-500 mt-0.5">
                  +1 (234) 567-890
                </Text>
              </View>
              <ChevronDownRegularIcon
                size={20}
                color="#9CA3AF"
                style={{ transform: [{ rotate: "-90deg" }] }}
              />
            </TouchableOpacity>

            {/* Live Chat */}
            <TouchableOpacity
              onPress={() => handleContactSupport("chat")}
              className="flex-row items-center p-4 bg-neutral-50 rounded-xl border border-neutral-200"
            >
              <View className="w-10 h-10 rounded-full bg-warning-100 items-center justify-center mr-3">
                <ChatRegularIcon size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-inter-semiBold text-neutral-900">
                  Live Chat
                </Text>
                <Text className="text-sm font-inter-regular text-neutral-500 mt-0.5">
                  Available 24/7
                </Text>
              </View>
              <ChevronDownRegularIcon
                size={20}
                color="#9CA3AF"
                style={{ transform: [{ rotate: "-90deg" }] }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View className="bg-white px-6 py-4 mb-2">
          <Text className="text-lg font-inter-bold text-neutral-900 mb-3">
            Frequently Asked Questions
          </Text>

          {faqs.map((faq, index) => (
            <View key={faq.id}>
              <TouchableOpacity
                onPress={() => toggleFaq(faq.id)}
                className="py-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 text-base font-inter-semiBold text-neutral-900 mr-3">
                    {faq.question}
                  </Text>
                  <ChevronDownRegularIcon
                    size={20}
                    color="#6B7280"
                    style={{
                      transform: [
                        { rotate: expandedFaq === faq.id ? "180deg" : "0deg" },
                      ],
                    }}
                  />
                </View>

                {expandedFaq === faq.id && (
                  <Text className="text-sm font-inter-regular text-neutral-600 mt-3 leading-6">
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>

              {index < faqs.length - 1 && (
                <View className="h-px bg-neutral-200" />
              )}
            </View>
          ))}
        </View>

        {/* Additional Resources */}
        <View className="bg-white px-6 py-4">
          <Text className="text-lg font-inter-bold text-neutral-900 mb-3">
            Additional Resources
          </Text>

          <TouchableOpacity className="py-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-inter-medium text-neutral-900">
                Terms of Service
              </Text>
              <ChevronDownRegularIcon
                size={20}
                color="#9CA3AF"
                style={{ transform: [{ rotate: "-90deg" }] }}
              />
            </View>
          </TouchableOpacity>

          <View className="h-px bg-neutral-200" />

          <TouchableOpacity className="py-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-inter-medium text-neutral-900">
                Privacy Policy
              </Text>
              <ChevronDownRegularIcon
                size={20}
                color="#9CA3AF"
                style={{ transform: [{ rotate: "-90deg" }] }}
              />
            </View>
          </TouchableOpacity>

          <View className="h-px bg-neutral-200" />

          <TouchableOpacity className="py-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-inter-medium text-neutral-900">
                Community Guidelines
              </Text>
              <ChevronDownRegularIcon
                size={20}
                color="#9CA3AF"
                style={{ transform: [{ rotate: "-90deg" }] }}
              />
            </View>
          </TouchableOpacity>

          <View className="h-px bg-neutral-200" />

          <TouchableOpacity className="py-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-inter-medium text-neutral-900">
                Safety Tips
              </Text>
              <ChevronDownRegularIcon
                size={20}
                color="#9CA3AF"
                style={{ transform: [{ rotate: "-90deg" }] }}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="px-6 py-6">
          <Text className="text-center text-sm font-inter-regular text-neutral-500">
            Sellio Version 1.0.0
          </Text>
          <Text className="text-center text-xs font-inter-regular text-neutral-400 mt-1">
            © 2025 Sellio. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpSupportScreen;
