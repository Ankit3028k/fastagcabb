import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DatePickerInput({
  date,
  onChange,
  error
}: {
  date: Date | null;
  onChange: (date: Date) => void;
  error?: string;
}) {
  const [show, setShow] = React.useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>Date of Birth *</Text>
      <TouchableOpacity onPress={() => setShow(true)} style={[styles.input, error && styles.inputError]}>
        <Text>{date ? date.toLocaleDateString('en-GB') : 'DD/MM/YYYY'}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={date ?? new Date(2000, 0, 1)}
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onChange={(_, selected) => {
            setShow(Platform.OS === 'ios');
            selected && onChange(selected);
          }}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 4, fontWeight: '600' },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  inputError: { borderColor: 'red' },
  error: { color: 'red', marginTop: 4 },
});
