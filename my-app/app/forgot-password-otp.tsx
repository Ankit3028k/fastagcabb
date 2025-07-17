import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export default function ForgotPasswordOtpScreen() {
  const { phoneNumber } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const { forgotPasswordSendOTP, isLoading } = useAuth();
  const { colors } = useTheme();
  
  // Create refs for each OTP input
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');
    
    const otpString = otp.join('');
    
    // Validate OTP
    if (!otpString || otpString.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    // Redirect to new password screen with phone number and OTP
    router.push({
      pathname: '/new-password',
      params: { 
        phoneNumber: phoneNumber as string,
        otp: otpString
      }
    });
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    const result = await forgotPasswordSendOTP(phoneNumber as string);
    
    if (result.success) {
      setCountdown(60);
      setCanResend(false);
      Alert.alert('Success', 'Reset code sent again to your WhatsApp');
      setOtp(['', '', '', '', '', '']);
    } else {
      Alert.alert('Error', result.message);
    }
    setIsResending(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Verify OTP</Text>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Enter the 6-digit code sent to your WhatsApp number {phoneNumber}
          </Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Verification Code</Text>
            <View style={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    { 
                      borderColor: otpError ? '#ff4444' : colors.border,
                      color: colors.text,
                      backgroundColor: colors.inputBackground || colors.background
                    }
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>
            {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, (otp.join('').length !== 6) && styles.verifyButtonDisabled]}
            onPress={handleVerifyOTP}
            disabled={otp.join('').length !== 6}
          >
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={isResending}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color="#0066cc" />
                ) : (
                  <Text style={[styles.resendText, { color: colors.primary }]}>Resend Code</Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text style={[styles.countdownText, { color: colors.textSecondary }]}>
                Resend code in {countdown}s
              </Text>
            )}
          </View>

          {/* WhatsApp Info */}
          <View style={styles.infoContainer}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Code sent via WhatsApp
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  otpContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
  },
  verifyButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  verifyButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendButton: {
    padding: 10,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '500',
  },
  countdownText: {
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
});
