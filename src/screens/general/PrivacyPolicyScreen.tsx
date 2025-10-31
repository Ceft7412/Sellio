import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

          <Text style={styles.paragraph}>
            Sellio ("we," "our," or "us") respects your privacy and is committed
            to protecting your personal information. This Privacy Policy
            explains how we collect, use, and share information when you use our
            marketplace platform.
          </Text>

          <Text style={styles.heading}>1. Information We Collect</Text>

          <Text style={styles.subheading}>Information You Provide</Text>
          <Text style={styles.paragraph}>
            • Account information (name, email, phone number){"\n"}• Profile
            information and photos{"\n"}• Product listings, descriptions, and
            images{"\n"}• Messages sent through our platform{"\n"}• Identity
            verification documents (when required){"\n"}
          </Text>

          <Text style={styles.subheading}>
            Automatically Collected Information
          </Text>
          <Text style={styles.paragraph}>
            • Device information (device type, operating system){"\n"}• Usage
            data (features used, time spent){"\n"}• Location data (when you
            enable location sharing){"\n"}• Log data (IP address, browser type,
            access times){"\n"}
          </Text>

          <Text style={styles.heading}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use your information to:{"\n\n"}• Provide and improve our
            marketplace services{"\n"}• Enable communication between buyers and
            sellers{"\n"}• Process transactions and prevent fraud{"\n"}• Verify
            user identity when necessary{"\n"}• Send important updates about
            your account or transactions{"\n"}• Respond to support requests
            {"\n"}• Comply with legal obligations{"\n"}
          </Text>

          <Text style={styles.heading}>3. Location Sharing</Text>
          <Text style={styles.paragraph}>
            Location sharing is optional and only enabled when you explicitly
            choose to share your location with another user. You can start or
            stop sharing at any time. Location data is only shared with the
            specific user you're conversing with and is used to coordinate
            meetups for item exchanges.
          </Text>

          <Text style={styles.heading}>4. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share information:
            {"\n\n"}• With other users as necessary (e.g., showing your
            listings){"\n"}• With service providers who help operate our
            platform{"\n"}• When required by law or to protect rights and safety
            {"\n"}• In connection with a business transfer or acquisition{"\n"}
          </Text>

          <Text style={styles.heading}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement reasonable security measures to protect your
            information. However, no method of transmission over the internet is
            100% secure. You are responsible for maintaining the security of
            your account credentials.
          </Text>

          <Text style={styles.heading}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:{"\n\n"}• Access and update your personal
            information{"\n"}• Delete your account and associated data{"\n"}•
            Opt out of promotional communications{"\n"}• Request a copy of your
            data{"\n"}
          </Text>

          <Text style={styles.heading}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our service is not intended for users under 18 years of age. We do
            not knowingly collect information from children under 18.
          </Text>

          <Text style={styles.heading}>8. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes through the app or by email.
          </Text>

          <Text style={styles.heading}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us
            through the app's support section.
          </Text>

          <View style={styles.footer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  lastUpdated: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
    color: "#000",
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
    color: "#333",
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    marginBottom: 12,
  },
  footer: {
    height: 40,
  },
});
