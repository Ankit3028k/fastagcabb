import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WhatsAppButtonProps {
  style?: any;
}

const WhatsAppButton = ({ style }: WhatsAppButtonProps) => {
  const sendInteraktMessage = async () => {
    try {
      const interaktApiUrl = 'https://api.interakt.ai/v1/public/message/';
      const apiKey = 'YOUR_INTERAKT_API_KEY'; // Replace with your Interakt API key
      
      const payload = {
        countryCode: '+91',
        phoneNumber: '8282820210', // Support number
        callbackData: 'support_request',
        type: 'Template',
        template: {
          name: 'support_template', // Your template name
          languageCode: 'en',
          headerValues: [],
          bodyValues: ['Customer Support Request'],
          buttonValues: {}
        }
      };

      const response = await fetch(interaktApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Success', 'Message sent successfully!');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Interakt error:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={sendInteraktMessage}
    >
      <Ionicons name="logo-whatsapp" size={30} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#25D366',
    borderRadius: 50,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default WhatsAppButton;
