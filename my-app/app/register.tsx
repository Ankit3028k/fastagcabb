import React, { useState, useCallback } from 'react';
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
  const { sendOtpRequest } = useAuth();

  // Update function for form fields
  const update = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: typeof value === 'string' ? value.trim() : value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'dateOfBirth' && value instanceof Date) {
      const today = new Date();
      let age = today.getFullYear() - value.getFullYear();
      const m = today.getMonth() - value.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < value.getDate())) age--;
      setForm(prev => ({ ...prev, age: age.toString() }));
    }
  }, [errors]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full Name is required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.dateOfBirth) e.dateOfBirth = 'Date of Birth is required';
    if (!form.age || +form.age < 18) e.age = 'Must be at least 18 years old';
    if (!form.phoneNumber) e.phoneNumber = 'Phone Number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) e.phoneNumber = 'Invalid phone number';
    if (form.adharNumber && !/^\d{12}$/.test(form.adharNumber)) e.adharNumber = 'Aadhar must be 12 digits';
    if (form.panCardNumber && !/^[A-Z]{5}\d{4}[A-Z]$/.test(form.panCardNumber)) e.panCardNumber = 'Invalid PAN format';
    if (!form.pinCode || !/^\d{6}$/.test(form.pinCode)) e.pinCode = 'PIN must be 6 digits';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.dealerCode.trim()) e.dealerCode = 'Dealer Code is required';
    if (!form.profilePhoto) e.profilePhoto = 'Profile Photo is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    console.log('🔍 Validating form data...');
    console.log('📋 Current form state:', { ...form, password: '[HIDDEN]' });
    if (!validate()) {
      console.log('🚫 Validation failed:', errors);
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('🚀 Sending OTP request for:', form.phoneNumber);
      const res = await sendOtpRequest(form.phoneNumber);
      console.log('📱 OTP request result:', res);
      if (res.success) {
        const payload = {
          fullName: form.fullName,
          password: form.password,
          dateOfBirth: form.dateOfBirth instanceof Date ? form.dateOfBirth : new Date(),
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

        console.log('📋 Registration payload:', { ...payload, password: '[HIDDEN]' });
        router.push({
          pathname: '/VerifyOtpScreen',
          params: { form: JSON.stringify(payload) }
        });
      } else {
        Alert.alert('Error', res.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please check your network and try again.');
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
            onPhotoSelected={uri => update('profilePhoto', uri )}
            error={errors.profilePhoto}
            cameraOnly={true}
            
            
          />

          <Field
            label="Full Name*"
            value={form.fullName}
            error={errors.fullName}
            onChange={(t: string) => update('fullName', t)}
            placeholder="Enter your full name"
          />
          <Field
            label="Password*"
            value={form.password}
            error={errors.password}
            onChange={(t: string) => update('password', t)}
            secure
            placeholder="Enter your password"
          />

          <DatePickerInput
            date={form.dateOfBirth}
            onChange={d => update('dateOfBirth', d)}
            error={errors.dateOfBirth}
          />
          <Field
            label="Age"
            value={form.age}
            error={errors.age}
            editable={false}
            placeholder="Calculated automatically"
          />

          <Field
            label="Phone Number*"
            value={form.phoneNumber}
            error={errors.phoneNumber}
            onChange={(t: string) => update('phoneNumber', t)}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
          />

          <Field
            label="Aadhar Number (Optional)"
            value={form.adharNumber}
            error={errors.adharNumber}
            onChange={(t: string) => update('adharNumber', t)}
            keyboardType="numeric"
            placeholder="Enter 12-digit Aadhar number"
          />
          <PhotoUpload
            title="Upload Aadhar Photo (Optional)"
            value={form.adharCard}
            onPhotoSelected={uri => update('adharCard', uri)}
          />

          <Field
            label="PAN Card (Optional)"
            value={form.panCardNumber}
            error={errors.panCardNumber}
            onChange={(t: string) => update('panCardNumber', t)}
            autoCapitalize="characters"
            placeholder="Enter PAN number"
          />
          <PhotoUpload
            title="Upload PAN Photo (Optional)"
            value={form.panCard}
            onPhotoSelected={uri => update('panCard', uri)}
          />

          <PhotoUpload
            title="Upload Bank Details (Optional)"
            value={form.bankDetails}
            onPhotoSelected={uri => update('bankDetails', uri)}
          />

          <Field
            label="PIN Code*"
            value={form.pinCode}
            error={errors.pinCode}
            onChange={(t: string) => update('pinCode', t)}
            keyboardType="numeric"
            placeholder="Enter 6-digit PIN code"
          />
          <Field
            label="State*"
            value={form.state}
            error={errors.state}
            onChange={(t: string) => update('state', t)}
            placeholder="Enter your state"
          />
          <Field
            label="City*"
            value={form.city}
            error={errors.city}
            onChange={(t: string) => update('city', t)}
            placeholder="Enter your city"
          />
          <Field
            label="Address*"
            value={form.address}
            error={errors.address}
            onChange={(t: string) => update('address', t)}
            multiline
            numberOfLines={3}
            placeholder="Enter your full address"
          />

          <Field
            label="Dealer Code*"
            value={form.dealerCode}
            error={errors.dealerCode}
            onChange={(t: string) => update('dealerCode', t)}
            placeholder="Enter dealer code"
          />

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

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, error, secure = false,
  keyboardType = 'default', autoCapitalize = 'none',
  multiline = false, numberOfLines = 1, placeholder = '', editable = true
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
        placeholder={placeholder}
        placeholderTextColor="#999"
        editable={editable}
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
  error: { color: 'red', marginTop: 4, fontSize: 14 },
  button: { backgroundColor: '#0066cc', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});