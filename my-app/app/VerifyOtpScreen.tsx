import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';

export default function VerifyOtpScreen() {
  const { form } = useLocalSearchParams();
  const parsed = form ? JSON.parse(form as string) : null;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyOtpAndRegister, resendOtpRequest } = useAuth();

  // Create refs for each OTP input
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Validate parsed form data
  useEffect(() => {
    if (!parsed || !parsed.phoneNumber) {
      Alert.alert('Error', 'Invalid registration data. Please try again.');
      router.back();
    }
  }, [parsed]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const onVerify = useCallback(async () => {
    if (!parsed) return;
    const otpString = otp.join('');
    if (!otpString || otpString.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await verifyOtpAndRegister(parsed.phoneNumber, otpString, parsed);
      if (res.success) {
        const redirectPath = res.autoLogin ? '/(tabs)' : '/login';
        Alert.alert(
          'Success',
          res.message || 'Your account has been created successfully!',
          [{ text: 'OK', onPress: () => router.replace(redirectPath) }]
        );
      } else {
        Alert.alert('Error', res.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Verification failed. Please check your network and try again.');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsVerifying(false);
    }
  }, [otp, parsed]);

  const onResendOTP = useCallback(async () => {
    if (!parsed || !canResend) return;
    try {
      setIsResending(true);
      const res = await resendOtpRequest(parsed.phoneNumber);
      if (res.success) {
        Alert.alert('Success', res.message || 'A new OTP has been sent.');
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        Alert.alert('Error', res.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please check your network.');
    } finally {
      setIsResending(false);
    }
  }, [parsed, canResend]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      // Auto-focus next input using ref
      otpRefs.current[index + 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Phone Number</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit OTP to {parsed?.phoneNumber || 'your number'}
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (otpRefs.current[index] = ref)}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={value => handleOtpChange(index, value)}
              textAlign="center"
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, (otp.join('').length !== 6 || isVerifying) && styles.disabledButton]}
          onPress={onVerify}
          disabled={isVerifying || otp.join('').length !== 6}
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
            <Text style={styles.countdownText}>Resend OTP in {countdown}s</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              'Confirm',
              'Are you sure you want to go back? Your progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: () => router.back() }
              ]
            );
          }}
        >
          <Text style={styles.backButtonText}>← Back to Registration</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb' },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 10, textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  otpInput: {
    borderWidth: 2,
    borderColor: '#0066cc',
    padding: 10,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#fff',
    width: 40,
    marginHorizontal: 5,
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
  disabledButton: { backgroundColor: '#ccc' },
  verifyButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  resendContainer: { alignItems: 'center', marginBottom: 30 },
  resendButton: { padding: 10 },
  resendText: { color: '#0066cc', fontSize: 16, fontWeight: '600' },
  countdownText: { color: '#666', fontSize: 16 },
  backButton: { alignItems: 'center', padding: 15 },
  backButtonText: { color: '#0066cc', fontSize: 16, fontWeight: '500' }
});