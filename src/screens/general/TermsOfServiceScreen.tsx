import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsOfServiceScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

          <Text style={styles.paragraph}>
            Welcome to Sellio. By accessing or using our platform, you agree to
            be bound by these Terms of Service. Please read them carefully.
          </Text>

          <Text style={styles.heading}>1. Account Registration</Text>
          <Text style={styles.paragraph}>
            You must be at least 18 years old to use Sellio. You agree to
            provide accurate information when creating your account and to keep
            your account credentials secure. You are responsible for all
            activities that occur under your account.
          </Text>

          <Text style={styles.heading}>2. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to:{"\n\n"}• Post false, misleading, or fraudulent
            listings{"\n"}• Sell prohibited or illegal items{"\n"}• Harass,
            threaten, or abuse other users{"\n"}• Use the platform for any
            illegal purpose{"\n"}• Attempt to circumvent platform fees or
            processes{"\n"}• Use automated tools to access the service{"\n"}
          </Text>

          <Text style={styles.heading}>3. Listings and Transactions</Text>
          <Text style={styles.paragraph}>
            Sellers are responsible for the accuracy of their listings and the
            condition of items sold. Sellio facilitates connections between
            buyers and sellers but is not directly involved in transactions. We
            do not process payments or guarantee the quality of items.
          </Text>

          <Text style={styles.subheading}>Seller Responsibilities</Text>
          <Text style={styles.paragraph}>
            • Accurately describe items and their condition{"\n"}• Respond to
            inquiries in a timely manner{"\n"}• Honor accepted offers and
            completed transactions{"\n"}• Meet buyers safely in public locations
            {"\n"}
          </Text>

          <Text style={styles.subheading}>Buyer Responsibilities</Text>
          <Text style={styles.paragraph}>
            • Review listings carefully before making offers{"\n"}• Complete
            transactions you commit to{"\n"}• Inspect items before finalizing
            exchanges{"\n"}• Report fraudulent activity{"\n"}
          </Text>

          <Text style={styles.heading}>4. Bidding and Offers</Text>
          <Text style={styles.paragraph}>
            Bids and accepted offers constitute binding commitments. Sellers
            should honor the highest bid when auctions close. Buyers should
            complete purchases when their bids win or offers are accepted.
          </Text>

          <Text style={styles.heading}>5. Safety and Meetups</Text>
          <Text style={styles.paragraph}>
            Always meet in safe, public locations when exchanging items. We
            recommend bringing a friend and meeting during daylight hours. Use
            the location sharing feature responsibly and only with trusted
            users.
          </Text>

          <Text style={styles.heading}>6. Identity Verification</Text>
          <Text style={styles.paragraph}>
            We may require identity verification for certain users or
            transactions. Verified users receive a badge on their profile. This
            helps build trust but does not guarantee transaction safety.
          </Text>

          <Text style={styles.heading}>7. Prohibited Items</Text>
          <Text style={styles.paragraph}>
            You may not sell:{"\n\n"}• Illegal items or services{"\n"}• Weapons,
            explosives, or hazardous materials{"\n"}• Stolen goods or
            counterfeit items{"\n"}• Prescription drugs or controlled substances
            {"\n"}• Live animals (unless permitted by law){"\n"}• Adult content
            or services{"\n"}
          </Text>

          <Text style={styles.heading}>8. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            You retain ownership of content you post but grant Sellio a license
            to use, display, and distribute it for platform purposes. Do not
            post content that infringes on others' intellectual property rights.
          </Text>

          <Text style={styles.heading}>9. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate accounts that violate
            these terms. You may delete your account at any time through the app
            settings.
          </Text>

          <Text style={styles.heading}>10. Disclaimers</Text>
          <Text style={styles.paragraph}>
            Sellio is provided "as is" without warranties. We do not guarantee
            the accuracy of listings or the reliability of users. We are not
            responsible for disputes between buyers and sellers or the quality
            of items sold.
          </Text>

          <Text style={styles.heading}>11. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by law, Sellio is not liable for
            indirect, incidental, or consequential damages arising from your use
            of the platform.
          </Text>

          <Text style={styles.heading}>12. Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            Users are encouraged to resolve disputes directly. If you have
            issues with another user, please report them through the app. For
            disputes with Sellio, contact our support team.
          </Text>

          <Text style={styles.heading}>13. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these Terms of Service periodically. Continued use of
            the platform after changes constitutes acceptance of the new terms.
          </Text>

          <Text style={styles.heading}>14. Contact</Text>
          <Text style={styles.paragraph}>
            Questions about these terms? Contact us through the app's support
            section.
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
