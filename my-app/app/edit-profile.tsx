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
    // mobileNumber: '',
    address: '',
    accountNumber: '',
    ifscCode: '',
    profilePhoto: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        // mobileNumber: user.mobileNumber || '',
        address: user.address || '',
        accountNumber: user.accountNumber || '',
        ifscCode: user.ifscCode || '',
        profilePhoto: user.profilePhoto || '',
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
    // if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    if (formData.accountNumber && !formData.ifscCode) {
      newErrors.ifscCode = 'IFSC code is required when account number is provided';
    }

    if (formData.ifscCode && !formData.accountNumber) {
      newErrors.accountNumber = 'Account number is required when IFSC code is provided';
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

            {/* Mobile Number */}
            {/* <InputField
              label="Mobile Number"
              icon="call-outline"
              value={formData.mobileNumber}
              onChangeText={text => updateField('mobileNumber', text)}
              error={errors.mobileNumber}
              editable={isEditable}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
            /> */}

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

            {/* Account Number */}
            <InputField
              label="Account Number"
              icon="card-outline"
              value={formData.accountNumber}
              onChangeText={text => updateField('accountNumber', text)}
              error={errors.accountNumber}
              editable={isEditable}
              placeholder="Enter your account number"
              keyboardType="number-pad"
            />

            {/* IFSC Code */}
            <InputField
              label="IFSC Code"
              icon="business-outline"
              value={formData.ifscCode}
              onChangeText={text => updateField('ifscCode', text.toUpperCase())}
              error={errors.ifscCode}
              editable={isEditable}
              placeholder="Enter your IFSC code"
              autoCapitalize="characters"
            />

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
