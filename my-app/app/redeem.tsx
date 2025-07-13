import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RedeemScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      {/* <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Redeem Status</Text>
        <View style={styles.placeholder} />
      </View> */}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '15' }]}>
            <Ionicons name="gift" size={40} color={colors.warning} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Redeem Status</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Track your redemption requests and view the status of your point redemptions. Monitor pending, approved, and completed redemptions.
          </Text>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusItem, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              <Text style={[styles.statusText, { color: colors.text }]}>3 Completed</Text>
            </View>
            <View style={[styles.statusItem, { backgroundColor: colors.warning + '10' }]}>
              <Ionicons name="time" size={24} color={colors.warning} />
              <Text style={[styles.statusText, { color: colors.text }]}>2 Pending</Text>
            </View>
            <View style={[styles.statusItem, { backgroundColor: colors.secondary + '10' }]}>
              <Ionicons name="close-circle" size={24} color={colors.secondary} />
              <Text style={[styles.statusText, { color: colors.text }]}>1 Rejected</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  statusContainer: {
    width: '100%',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});
