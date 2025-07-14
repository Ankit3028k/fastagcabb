import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhoneInputComponent from '@/components/PhoneInput';
import DatePickerInput from '@/components/DatePickerInput';
import PhotoUpload from '@/components/PhotoUpload';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    fullName: '', password: '', dateOfBirth: null as Date | null,
    age: '', phoneNumber: '', adharNumber: '', panCardNumber: '',
    pinCode: '', state: '', city: '', address: '', dealerCode: '',
    profilePhoto: '', adharCard: '', panCard: '', bankDetails: '',
    role: 'Electrician'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendOtpRequest, login } = useAuth();

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'dateOfBirth' && value instanceof Date) {
      const today = new Date();
      let age = today.getFullYear() - value.getFullYear();
      const m = today.getMonth() - value.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < value.getDate())) age--;
      setForm(prev => ({ ...prev, age: age.toString() }));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 chars';
    if (!form.dateOfBirth) e.dateOfBirth = 'Required';
    if (!form.age || +form.age < 18) e.age = 'Invalid age';
    if (!form.phoneNumber) e.phoneNumber = 'Required';
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) e.phoneNumber = 'Invalid phone';
    if (form.adharNumber && !/^\d{12}$/.test(form.adharNumber)) e.adharNumber = 'Must be 12 digits';
    if (form.panCardNumber && !/^[A-Z]{5}\d{4}[A-Z]$/.test(form.panCardNumber)) e.panCardNumber = 'Invalid PAN';
    if (!form.pinCode || !/^\d{6}$/.test(form.pinCode)) e.pinCode = '6-digit PIN';
    if (!form.state.trim()) e.state = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.dealerCode.trim()) e.dealerCode = 'Dealer Code is required';
    if (!form.profilePhoto) e.profilePhoto = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    console.log('🔍 Validating form data...');
    console.log('📋 Current form state:', form);
    const isValid = validate();
    console.log('✅ Validation result:', isValid);
    console.log('❌ Validation errors:', errors);

    if (!isValid) {
      console.log('🚫 Validation failed, stopping registration');
      return;
    }

    // Additional check for dateOfBirth
    if (!form.dateOfBirth) {
      Alert.alert('Error', 'Please select your date of birth');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('🚀 Starting registration process for phone:', form.phoneNumber);
      const res = await sendOtpRequest(form.phoneNumber);
      console.log('📱 OTP request result:', res);
      if (res.success) {
        const payload = {
          fullName: form.fullName,
          password: form.password,
          dateOfBirth: form.dateOfBirth instanceof Date ? form.dateOfBirth : (form.dateOfBirth ? new Date(form.dateOfBirth) : new Date()),
          age: parseInt(form.age),
          phoneNumber: form.phoneNumber,
          adharNumber: form.adharNumber,
          panCardNumber: form.panCardNumber,
          pinCode: form.pinCode,
          state: form.state,
          city: form.city,
          address: form.address,
          dealerCode: form.dealerCode.toUpperCase(),
          profilePhoto: form.profilePhoto,
          adharCard: form.adharCard,
          panCard: form.panCard,
          bankDetails: form.bankDetails,
          role: form.role
        };

        console.log('📋 Registration payload prepared:', {
          ...payload,
          dateOfBirth: payload.dateOfBirth.toISOString(),
          password: '[HIDDEN]'
        });

        router.push({
          pathname: '/VerifyOtpScreen',
          params: { form: JSON.stringify(payload) }
        });
      } else {
        Alert.alert('Error', res.message);
      }
    } catch {
      Alert.alert('Error', 'OTP send failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Create Account</Text>

          <PhotoUpload
            title="Profile Photo*"
            value={form.profilePhoto}
            onPhotoSelected={uri => update('profilePhoto', uri)}
            error={errors.profilePhoto}
          />

          <Field label="Full Name*" value={form.fullName} error={errors.fullName} onChange={t => update('fullName', t)} />
          <Field label="Password*" value={form.password} error={errors.password} onChange={t => update('password', t)} secure />

          <DatePickerInput
            date={form.dateOfBirth}
            onChange={d => update('dateOfBirth', d)}
            error={errors.dateOfBirth}
          />
          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, errors.age && styles.errorInput]}
              value={form.age}
              editable={false}
            />
          </View>

          <Field
            label="Phone Number*"
            value={form.phoneNumber}
            error={errors.phoneNumber}
            onChange={t => update('phoneNumber', t)}
            keyboardType="phone-pad"
          />

          <Field
            label="Aadhar Number (Optional)"
            value={form.adharNumber}
            error={errors.adharNumber}
            onChange={t => update('adharNumber', t)}
            keyboardType="numeric"
          />
          <PhotoUpload
            title="Upload Aadhar Photo"
            value={form.adharCard}
            onPhotoSelected={uri => update('adharCard', uri)}
          />

          <Field
            label="PAN Card (Optional)"
            value={form.panCardNumber}
            error={errors.panCardNumber}
            onChange={t => update('panCardNumber', t)}
            autoCapitalize="characters"
          />
          <PhotoUpload
            title="Upload PAN Photo"
            value={form.panCard}
            onPhotoSelected={uri => update('panCard', uri)}
          />

          <PhotoUpload
            title="Upload Bank Details (Passbook/Statement)"
            value={form.bankDetails}
            onPhotoSelected={uri => update('bankDetails', uri)}
          />

          <Field label="PIN Code*" value={form.pinCode} error={errors.pinCode} onChange={t => update('pinCode', t)} keyboardType="numeric" />
          <Field label="State*" value={form.state} error={errors.state} onChange={t => update('state', t)} />
          <Field label="City*" value={form.city} error={errors.city} onChange={t => update('city', t)} />
          <Field
            label="Address*"
            value={form.address}
            error={errors.address}
            onChange={t => update('address', t)}
            multiline
            numberOfLines={3}
          />

          <Field label="Dealer Code*" value={form.dealerCode} error={errors.dealerCode} onChange={t => update('dealerCode', t)} />

          {/* Role Picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Role*</Text>
            <Picker
              selectedValue={form.role}
              onValueChange={(val) => update('role', val)}
              style={styles.input}
            >
              <Picker.Item label="Electrician" value="Electrician" />
              <Picker.Item label="Distributor" value="Distributor" />
            </Picker>
          </View>

          {/* Debug Buttons - Remove after testing */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#ff6b6b', marginBottom: 10 }]}
            onPress={() => {
              console.log('🔍 Debug - Current form state:', form);
              console.log('🔍 Debug - Current errors:', errors);
              const testValid = validate();
              console.log('🔍 Debug - Validation result:', testValid);
            }}
          >
            <Text style={styles.buttonText}>Debug Form</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#9b59b6', marginBottom: 10 }]}
            onPress={async () => {
              try {
                console.log('🌐 Testing backend connection...');
                const backendUrl = 'https://fastagcabb.onrender.com';
                const testUrl = `${backendUrl}/api/auth/test`;
                console.log('📡 Testing URL:', testUrl);

                const response = await fetch(testUrl);
                console.log('📡 Test response status:', response.status);
                const data = await response.json();
                console.log('📡 Test response data:', data);

                Alert.alert('Backend Test', `Status: ${response.status}\nMessage: ${data.message || 'Connected'}`);
              } catch (error: any) {
                console.error('🚨 Backend test failed:', error);
                Alert.alert('Backend Test Failed', error.message || 'Unknown error');
              }
            }}
          >
            <Text style={styles.buttonText}>Test Backend</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#27ae60', marginBottom: 10 }]}
            onPress={async () => {
              try {
                console.log('🧪 Testing mock login...');
                const result = await login('8959305284', 'securePass123');
                console.log('🧪 Mock login result:', result);

                if (result.success) {
                  Alert.alert('Mock Login Success', result.message, [
                    { text: 'OK', onPress: () => router.replace('/(tabs)') }
                  ]);
                } else {
                  Alert.alert('Mock Login Failed', result.message);
                }
              } catch (error: any) {
                console.error('🚨 Mock login test failed:', error);
                Alert.alert('Mock Login Test Failed', error.message || 'Unknown error');
              }
            }}
          >
            <Text style={styles.buttonText}>Test Mock Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, error, secure = false,
  keyboardType = 'default', autoCapitalize = 'none', multiline = false, numberOfLines = 1
}: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.errorInput]}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb' },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 24, textAlign: 'center', color: '#333' },
  field: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#444' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', fontSize: 16 },
  errorInput: { borderColor: 'red' },
  error: { color: 'red', marginTop: 4 },
  button: { backgroundColor: '#0066cc', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});

