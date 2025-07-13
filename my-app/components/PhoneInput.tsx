import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';

export default function PhoneInputComponent({
  value,
  onChangeFormatted,
  error,
}: {
  value: string;
  onChangeFormatted: (formatted: string) => void;
  error?: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <PhoneInput
        defaultCode="IN"
        value={value}
        layout="first"
        onChangeFormattedText={onChangeFormatted}
        containerStyle={styles.container}
        textContainerStyle={styles.textInputContainer}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 85,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    
  },
  textInputContainer: {
    backgroundColor: '#fff',
    color: '#000',
    position:'absolute',
    zIndex:1,
    borderRadius: 10,
  
  },
  error: { color: 'red', marginTop: 4 },
});
