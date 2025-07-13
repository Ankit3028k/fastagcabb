import { useTheme } from '@/contexts/ThemeContext';
import { FontAwesome } from 'react-native-vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Linking,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormData {
  phoneNumber: string;
  subject: string;
  message: string;
}

interface FormErrors {
  phoneNumber?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Success', 'Message sent successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setFormData({
              phoneNumber: '',
              subject: '',
              message: '',
            });
            setErrors({});
          },
        },
      ]);
    }, 1500);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header with Back Button */}
        <View style={[styles.headerBar, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Contact Us</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="mail-outline" size={40} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Get In Touch</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              We'd love to hear from you. Send us a message!
            </Text>
          </View>

          {/* Contact Form */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Send Message</Text>
            
            {/* Phone Number Field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputWrapper,
                { borderColor: errors.phoneNumber ? colors.error : colors.border }
              ]}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.phoneNumber}
                  onChangeText={(text) => updateField('phoneNumber', text)}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={10}
                />
              </View>
              {errors.phoneNumber && <Text style={[styles.errorText, { color: colors.error }]}>{errors.phoneNumber}</Text>}
            </View>

            {/* Subject Field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Subject <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputWrapper,
                { borderColor: errors.subject ? colors.error : colors.border }
              ]}>
                <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter subject"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.subject}
                  onChangeText={(text) => updateField('subject', text)}
                />
              </View>
              {errors.subject && <Text style={[styles.errorText, { color: colors.error }]}>{errors.subject}</Text>}
            </View>

            {/* Message Field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Message <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.textAreaWrapper,
                { borderColor: errors.message ? colors.error : colors.border }
              ]}>
                <TextInput
                  style={[styles.textArea, { color: colors.text }]}
                  placeholder="Write your message here..."
                  placeholderTextColor={colors.textSecondary}
                  value={formData.message}
                  onChangeText={(text) => updateField('message', text)}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
              {errors.message && <Text style={[styles.errorText, { color: colors.error }]}>{errors.message}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                isSubmitting && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View style={styles.contactInfoSection}>
            <Text style={[styles.sectionTitle, { color: colors.warning }]}>Contact Information</Text>
            
           

            <View style={styles.contactItem}>
              <Ionicons name="business-outline" size={24} color={colors.primary} />
              <View style={styles.contactDetails}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Company</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>FASTAGCAB Pvt. Ltd.</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <FontAwesome name="whatsapp" size={24} color={colors.primary} />
              <View style={styles.contactDetails}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Whatsapp</Text>
                <Text onPress={() => Linking.openURL('https://wa.link/2n1lby')} style={[styles.contactValue, { color: colors.text }]}>
                  8282820210
                </Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={24} color={colors.primary} />
              <View style={styles.contactDetails}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Support Phone</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>+91 9876543210</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={24} color={colors.primary} />
              <View style={styles.contactDetails}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Contact Number</Text>
                <Text  onPress={() => Linking.openURL('tel:+918282820210')} style={[styles.contactValue, { color: colors.text }]}>+91 8282820210</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  textAreaWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 120,
  },
  textArea: {
    fontSize: 16,
    minHeight: 88,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactInfoSection: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    backgroundColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactDetails: {
    flex: 1,
    marginLeft: 16,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    lineHeight: 22,
  },
});
