import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RechargePage() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  // Use environment variable or fallback to the correct IP for React Native
  const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.144.132:5000';
  const [mobileNumber, setMobileNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const monthlyPoints = user?.monthlyPoints || 0;

  const handleConfirm = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter mobile number');
      return;
    }
    if (!operator.trim()) {
      Alert.alert('Error', 'Please enter operator');
      return;
    }

    if (monthlyPoints < 500) {
      Alert.alert('Insufficient Points', 'You need at least 500 points to redeem a recharge.');
      return;
    }

    setIsProcessing(true);
    try {
      // Get the stored token
      const storedToken = await AsyncStorage.getItem('authToken');

      if (!storedToken) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        return;
      }

      // Call the recharge API
      const response = await fetch(`${backendUrl}/api/users/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify({
          mobileNumber: mobileNumber.trim(),
          operator: operator.trim(),
          pointsToDeduct: 500
        })
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          'Success!',
          `${result.message}\nMobile: ${mobileNumber}\nOperator: ${operator}\nRemaining Points: ${result.data.remainingPoints}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to process recharge. Please try again.');
      }
    } catch (error) {
      console.error('Recharge error:', error);
      Alert.alert('Error', 'Failed to process recharge. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="phone-portrait" size={40} color={colors.primary} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>Mobile Recharge</Text>
          
          {/* Disclaimer */}
          <View style={[styles.disclaimerContainer, { backgroundColor: '#FFA50020', borderColor: '#FFA500' }]}>
            <Ionicons name="information-circle" size={20} color="#FFA500" />
            <Text style={[styles.disclaimerText, { color: colors.text }]}>
              Recharge requires 500 points. Points will be deducted upon confirmation. 
              Recharge will be processed within 24 hours.
            </Text>
          </View>

          {/* Points Display */}
          <View style={[styles.pointsDisplay, { backgroundColor: colors.primary + '10' }]}>
            <Text style={[styles.pointsLabel, { color: '#666' }]}>
              Available Points
            </Text>
            <Text style={[styles.pointsValue, { color: colors.primary }]}>
              {monthlyPoints}
            </Text>
          </View>

          {/* Mobile Number Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Mobile Number</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border, 
                backgroundColor: colors.card,
                color: colors.text 
              }]}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Operator Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Operator</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border, 
                backgroundColor: colors.card,
                color: colors.text 
              }]}
              value={operator}
              onChangeText={setOperator}
              placeholder="e.g., Airtel, Jio, Vi, BSNL"
              placeholderTextColor="#666"
            />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton, 
              { 
                backgroundColor: monthlyPoints >= 500 ? colors.primary : '#666',
                opacity: isProcessing ? 0.7 : 1
              }
            ]}
            onPress={handleConfirm}
            disabled={isProcessing || monthlyPoints < 500}
          >
            <Ionicons 
              name={isProcessing ? "hourglass" : "checkmark-circle"} 
              size={20} 
              color="white" 
            />
            <Text style={styles.confirmButtonText}>
              {isProcessing ? 'Processing...' : 'Confirm Recharge'}
            </Text>
          </TouchableOpacity>

          {monthlyPoints < 500 && (
            <Text style={[styles.insufficientText, { color: '#FF0000' }]}>
              You need {500 - monthlyPoints} more points to redeem a recharge
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 20,
  },
  pointsDisplay: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  insufficientText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
