import PhotoUpload from '@/components/PhotoUpload';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const { user, updateUserProfile, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    dateOfBirth: null as Date | null,
    age: '',
    phoneNumber: '',
    adharNumber: '',
    panCardNumber: '',
    pinCode: '',
    state: '',
    city: '',
    address: '',
    dealerCode: '',
    profilePhoto: '',
    adharCard: '',
    panCard: '',
    bankDetails: '',
    role: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName || '',
        password: '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
        age: user.age?.toString() || '',
        phoneNumber: user.phoneNumber || '',
        adharNumber: user.adharNumber || '',
        panCardNumber: user.panCardNumber || '',
        pinCode: user.pinCode || '',
        state: user.state || '',
        city: user.city || '',
        address: user.address || '',
        dealerCode: user.dealerCode || '',
        profilePhoto: user.profilePhoto || '',
        adharCard: user.adharCard || '',
        panCard: user.panCard || '',
        bankDetails: user.bankDetails || '',
        role: user.role || '',
      });
    }
  }, [user]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'Pin code is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.dealerCode.trim()) newErrors.dealerCode = 'Dealer code is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    if (formData.adharNumber && formData.adharNumber.length !== 12) {
      newErrors.adharNumber = 'Aadhar number must be 12 digits';
    }

    if (formData.panCardNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCardNumber)) {
      newErrors.panCardNumber = 'Invalid PAN format';
    }

    if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const isEditable = user?.status !== 'approved';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {!isEditable && (
            <View style={styles.warningBanner}>
              <Ionicons name="information-circle" size={20} color="#fff" />
              <Text style={styles.warningText}>
                Your profile has been approved. Contact support for any changes.
              </Text>
            </View>
          )}

          <View style={styles.form}>
            {/* Name */}
            <InputField
              label="Full Name"
              icon="person-outline"
              value={formData.name}
              onChangeText={text => updateField('name', text)}
              error={errors.name}
              editable={isEditable}
              placeholder="Enter your full name"
            />

            {/* Password */}
            <InputField
              label="Password"
              icon="lock-closed-outline"
              value={formData.password}
              onChangeText={text => updateField('password', text)}
              error={errors.password}
              editable={isEditable}
              placeholder="Enter new password (leave blank to keep current)"
              secureTextEntry
            />

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, errors.dateOfBirth ? styles.inputError : null]}
                onPress={() => {
                  if (isEditable) {
                    // Add date picker logic here
                  }
                }}
                disabled={!isEditable}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={[styles.input, { paddingTop: 12 }]}>
                  {formData.dateOfBirth ? formData.dateOfBirth.toDateString() : 'Select date of birth'}
                </Text>
              </TouchableOpacity>
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>

            {/* Age */}
            <InputField
              label="Age"
              icon="time-outline"
              value={formData.age}
              onChangeText={text => updateField('age', text)}
              error={errors.age}
              editable={false}
              placeholder="Calculated automatically"
            />

            {/* Phone Number */}
            <InputField
              label="Phone Number"
              icon="call-outline"
              value={formData.phoneNumber}
              onChangeText={text => updateField('phoneNumber', text)}
              error={errors.phoneNumber}
              editable={isEditable}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />

            {/* Aadhar Number */}
            <InputField
              label="Aadhar Number (Optional)"
              icon="card-outline"
              value={formData.adharNumber}
              onChangeText={text => updateField('adharNumber', text)}
              error={errors.adharNumber}
              editable={isEditable}
              placeholder="Enter 12-digit Aadhar number"
              keyboardType="number-pad"
            />

            {/* Aadhar Card Photo */}
            <PhotoUpload
              title="Aadhar Card Photo (Optional)"
              subtitle="Upload clear photo of Aadhar card"
              value={formData.adharCard}
              onPhotoSelected={(uri) => updateField('adharCard', uri)}
              error={errors.adharCard}
              icon="card-outline"
              disabled={!isEditable}
            />

            {/* PAN Card Number */}
            <InputField
              label="PAN Card Number (Optional)"
              icon="business-outline"
              value={formData.panCardNumber}
              onChangeText={text => updateField('panCardNumber', text.toUpperCase())}
              error={errors.panCardNumber}
              editable={isEditable}
              placeholder="Enter PAN number"
              autoCapitalize="characters"
            />

            {/* PAN Card Photo */}
            <PhotoUpload
              title="PAN Card Photo (Optional)"
              subtitle="Upload clear photo of PAN card"
              value={formData.panCard}
              onPhotoSelected={(uri) => updateField('panCard', uri)}
              error={errors.panCard}
              icon="business-outline"
              disabled={!isEditable}
            />

            {/* Pin Code */}
            <InputField
              label="Pin Code"
              icon="location-outline"
              value={formData.pinCode}
              onChangeText={text => updateField('pinCode', text)}
              error={errors.pinCode}
              editable={isEditable}
              placeholder="Enter pin code"
              keyboardType="number-pad"
            />

            {/* State */}
            <InputField
              label="State"
              icon="map-outline"
              value={formData.state}
              onChangeText={text => updateField('state', text)}
              error={errors.state}
              editable={isEditable}
              placeholder="Enter your state"
            />

            {/* City */}
            <InputField
              label="City"
              icon="location-outline"
              value={formData.city}
              onChangeText={text => updateField('city', text)}
              error={errors.city}
              editable={isEditable}
              placeholder="Enter your city"
            />

            {/* Address */}
            <InputField
              label="Address"
              icon="home-outline"
              value={formData.address}
              onChangeText={text => updateField('address', text)}
              error={errors.address}
              editable={isEditable}
              placeholder="Enter your address"
              multiline
            />

            {/* Dealer Code */}
            <InputField
              label="Dealer Code"
              icon="business-outline"
              value={formData.dealerCode}
              onChangeText={text => updateField('dealerCode', text.toUpperCase())}
              error={errors.dealerCode}
              editable={isEditable}
              placeholder="Enter dealer code"
              autoCapitalize="characters"
            />

            {/* Role */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Role</Text>
              <View style={[styles.inputWrapper, errors.role ? styles.inputError : null]}>
                <Ionicons name="person-circle-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={[styles.input, { paddingTop: 12, color: isEditable ? '#000' : '#666' }]}>
                  {formData.role}
                </Text>
              </View>
              {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
            </View>

            {/* Profile Photo Upload */}
            <PhotoUpload
              title="Profile Photo"
              subtitle="Upload a clear photo of yourself"
              value={formData.profilePhoto}
              onPhotoSelected={(uri) => updateField('profilePhoto', uri)}
              error={errors.profilePhoto}
              required
              icon="person-outline"
              disabled={!isEditable}
            />

            {/* Bank Details Photo */}
            <PhotoUpload
              title="Bank Details (Optional)"
              subtitle="Upload bank passbook or statement"
              value={formData.bankDetails}
              onPhotoSelected={(uri) => updateField('bankDetails', uri)}
              error={errors.bankDetails}
              icon="card-outline"
              disabled={!isEditable}
            />

            {isEditable && (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Reusable input field component
 */
const InputField = ({
  label,
  icon,
  value,
  onChangeText,
  error,
  editable,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: {
  label: string;
  icon: any;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  editable: boolean;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
      <Ionicons name={icon} size={20} color="#666" style={styles.inputIcon} />
      <TextInput
        style={[styles.input, multiline && { height: 80 }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  warningBanner: {
    backgroundColor: '#FF9500',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  warningText: {
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#1ca63a',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});








