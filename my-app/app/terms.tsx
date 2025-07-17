import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="document-text" size={40} color={colors.info} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Terms & Conditions</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            FASTAG CABLE PRIVATE LIMITED ELECTRICIAN WELFARE SCHEME  01/APRIL/25 TO 01/SEP/25
          </Text>

          {/* Rewards Program */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Exclusive Rewards Program for Electricians</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Earn Points on Every Purchase
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>✅ 500 Points = 1-Month Mobile Recharge FREE</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>Only with FASTAGCAB.</Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Easy Redemption through FASTAGCAB App</Text>
          <View style={styles.bulletBox}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Scan the QR code on your wire box.</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Instantly track and accumulate points.</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Redeem your rewards hassle-free.</Text>
          </View>

          <Text style={[styles.paragraph, { color: colors.text }]}>FASTAGCAB – The Promise of Safety, The Power of Rewards.</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>SCAN. PHONE. RECHARGE. WITH FASTAGCAB.</Text>

          {/* Terms Section */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>1⃣ Scheme Eligibility:</Text>
          <View style={styles.bulletBox}>
            <Text style={[styles.bullet, { color: colors.text }]}>• This reward scheme is exclusively for registered FASTAGCAB Electrician Members who are actively promoting our brand and selling FASTAGCAB wires & cables.</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Participant must complete their registration on the FASTAGCAB App by downloading and signing up with valid credentials.</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>2⃣ Valid Products:</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Points are awarded only on purchases of original FASTAGCAB wires & cables, as per the following structure:
          </Text>

          {/* Table repeated here for rule 2 confirmation */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Wire Size (90 Meters) Points Earned</Text>
          <View style={styles.table}>
            {[
              ['0.75 mm', '5 Points'],
              ['1.0 mm', '10 Points'],
              ['1.5 mm', '15 Points'],
              ['2.5 mm', '25 Points'],
              ['4.0 mm', '40 Points'],
              ['6.0 mm', '60 Points'],
              ['10.0 mm', '100 Points'],
            ].map(([size, points], index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { color: colors.text }]}>{size}</Text>
                <Text style={[styles.tableCell, { color: colors.textSecondary, textAlign: 'right' }]}>{points}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>3⃣ How to Accumulate Points:</Text>
          <View style={styles.bulletBox}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Scan the QR code provided on each wire box using the FASTAGCAB App.</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Points will be automatically credited to your account upon successful scan.</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>4⃣ Reward Criteria:</Text>
          <View style={styles.bulletBox}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Once a member accumulates 500 Points, they become eligible for a 1-Month Mobile Recharge absolutely FREE.</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Recharges will be processed within 72 working hours after reaching the milestone.</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>5⃣ Duration:</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            This scheme is valid until further notice or as communicated by FASTAGCAB through official channels.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>6⃣ Important Notes:</Text>
          <View style={styles.bulletBox}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Points are non-transferable, non-refundable, and cannot be encashed.</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• FASTAGCAB reserves the right to verify purchase authenticity and the electrician’s registration details.</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Any misuse, misrepresentation, or fraudulent activity will lead to immediate disqualification from the scheme and possible termination of FASTAGCAB membership.</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>7⃣ Customer Support:</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            For any queries related to this scheme, reach out to us via:
          </Text>
          <View style={styles.bulletBox}>
            <Text style={[styles.bullet, { color: colors.text }]}>• Toll-Free Number: +91-8282820210</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• WhatsApp: +91-8282820210</Text>
            <Text style={[styles.bullet, { color: colors.text }]}>• Email: support@fastagcab.com</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>8⃣ Disclaimer:</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            FASTAGCAB reserves the right to amend, modify, or withdraw this scheme at its sole discretion, without prior notice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletBox: {
    marginLeft: 12,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
  },
});
