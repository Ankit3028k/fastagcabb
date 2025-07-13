// screens/VerifyOtpScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { router, useSearchParams } from 'expo-router';

export default function VerifyOtpScreen() {
  const { form } = useSearchParams();
  const parsed = form ? JSON.parse(form as string) : null;
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyOtpAndRegister } = useAuth();

  const onVerify = async () => {
    if (!parsed) return;
    if (!otp.trim()) return Alert.alert('Enter OTP');
    try {
      setIsVerifying(true);
      const res = await verifyOtpAndRegister(parsed.mobileNumber, otp, parsed);
      if (res.success) {
        Alert.alert('Registered!', 'Your account is now created', [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]);
      } else {
        Alert.alert('OTP failed', res.message);
      }
    } catch {
      Alert.alert('Error', 'Verification error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput keyboardType="numeric" style={styles.input} placeholder="OTP" value={otp} onChangeText={setOtp} />
      <TouchableOpacity style={styles.button} onPress={onVerify} disabled={isVerifying}>
        {isVerifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Register</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, fontSize: 18, marginBottom: 20 },
  button: { backgroundColor: '#1ca63a', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
