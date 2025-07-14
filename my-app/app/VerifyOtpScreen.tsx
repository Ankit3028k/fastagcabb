// screens/VerifyOtpScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';

export default function VerifyOtpScreen() {
  const { form } = useLocalSearchParams();
  const parsed = form ? JSON.parse(form as string) : null;
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyOtpAndRegister, resendOtpRequest } = useAuth();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const onVerify = async () => {
    if (!parsed) return;
    if (!otp.trim()) return Alert.alert('Error', 'Please enter the OTP');
    if (otp.length !== 6) return Alert.alert('Error', 'Please enter a valid 6-digit OTP');
    
    try {
      setIsVerifying(true);
      const res = await verifyOtpAndRegister(parsed.phoneNumber, otp, parsed);
      if (res.success) {
        const redirectPath = res.autoLogin ? '/(tabs)' : '/login';
        const message = res.message || 'Your account has been created successfully. Welcome to FASTAGCAB!';

        Alert.alert(
          'Registration Successful!',
          message,
          [{ text: 'OK', onPress: () => router.replace(redirectPath) }]
        );
      } else {
        Alert.alert('Verification Failed', res.message || 'Invalid OTP. Please try again.');
        setOtp(''); // Clear OTP field on failure
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const onResendOTP = async () => {
    if (!parsed || !canResend) return;
    
    try {
      setIsResending(true);
      const res = await resendOtpRequest(parsed.phoneNumber);
      if (res.success) {
        Alert.alert('OTP Resent', res.message || 'A new OTP has been sent to your mobile number.');
        setCountdown(60);
        setCanResend(false);
        setOtp(''); // Clear current OTP
      } else {
        Alert.alert('Resend Failed', res.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Phone Number</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit OTP to {parsed?.phoneNumber}
        </Text>
        
        <View style={styles.otpContainer}>
          <TextInput 
            keyboardType="numeric" 
            style={styles.otpInput} 
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            textAlign="center"
            fontSize={24}
            autoFocus
          />
        </View>

        <TouchableOpacity 
          style={[styles.verifyButton, (!otp || otp.length !== 6) && styles.disabledButton]}
          onPress={onVerify}
          disabled={isVerifying || !otp || otp.length !== 6}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={onResendOTP}
              disabled={isResending}
            >
              {isResending ? (
                <ActivityIndicator size="small" color="#0066cc" />
              ) : (
                <Text style={styles.resendText}>Resend OTP</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.countdownText}>
              Resend OTP in {countdown}s
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back to Registration</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f9fb' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 10, 
    textAlign: 'center',
    color: '#333'
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 40,
    lineHeight: 22
  },
  otpContainer: {
    marginBottom: 30,
    alignItems: 'center'
  },
  otpInput: { 
    borderWidth: 2, 
    borderColor: '#0066cc', 
    padding: 20, 
    borderRadius: 12, 
    fontSize: 24, 
    textAlign: 'center',
    backgroundColor: '#fff',
    width: 250,
    letterSpacing: 6,
    fontWeight: '600'
  },
  verifyButton: { 
    backgroundColor: '#0066cc', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  verifyButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600' 
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  resendButton: {
    padding: 10
  },
  resendText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '600'
  },
  countdownText: {
    color: '#666',
    fontSize: 16
  },
  backButton: {
    alignItems: 'center',
    padding: 15
  },
  backButtonText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '500'
  }
});
