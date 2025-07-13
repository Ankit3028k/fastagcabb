import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
  phoneNumber: string;
}

const LoginTester: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [password, setPassword] = useState('password123');
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Demo accounts for testing
  const demoAccounts = [
    { phoneNumber: '9876543210', password: 'password123', role: 'Electrician' },
    { phoneNumber: '9123456789', password: 'testpass', role: 'Distributor' },
    { phoneNumber: '9999999999', password: 'admin123', role: 'Admin' },
  ];

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    const newResult: TestResult = {
      ...result,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTestResults(prev => [newResult, ...prev]);
  };

  const testLogin = async (testPhoneNumber?: string, testPassword?: string) => {
    const phone = testPhoneNumber || phoneNumber;
    const pass = testPassword || password;

    if (!phone.trim() || !pass.trim()) {
      Alert.alert('Error', 'Please enter both phone number and password');
      return;
    }

    try {
      const result = await login(phone, pass);
      
      addTestResult({
        success: result.success,
        message: result.message,
        phoneNumber: phone,
      });

      if (result.success) {
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Network error or unexpected error',
        phoneNumber: phone,
      });
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const testDemoAccount = (account: typeof demoAccounts[0]) => {
    testLogin(account.phoneNumber, account.password);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Login Route Tester</Text>
      
      {/* Manual Test Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual Test</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number:</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => testLogin()}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Test Login</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Demo Accounts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo Accounts</Text>
        {demoAccounts.map((account, index) => (
          <View key={index} style={styles.demoAccount}>
            <View style={styles.demoInfo}>
              <Text style={styles.demoPhone}>{account.phoneNumber}</Text>
              <Text style={styles.demoRole}>{account.role}</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => testDemoAccount(account)}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Test</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Test Results Section */}
      <View style={styles.section}>
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearResults}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No test results yet</Text>
        ) : (
          testResults.map((result, index) => (
            <View
              key={index}
              style={[
                styles.resultItem,
                result.success ? styles.successResult : styles.errorResult,
              ]}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultPhone}>{result.phoneNumber}</Text>
                <Text style={styles.resultTime}>{result.timestamp}</Text>
              </View>
              <Text
                style={[
                  styles.resultMessage,
                  result.success ? styles.successText : styles.errorText,
                ]}
              >
                {result.success ? '✅' : '❌'} {result.message}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 36,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  demoAccount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  demoInfo: {
    flex: 1,
  },
  demoPhone: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  demoRole: {
    fontSize: 14,
    color: '#666',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  resultItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  successResult: {
    backgroundColor: '#f0f9f0',
    borderColor: '#34C759',
  },
  errorResult: {
    backgroundColor: '#fff0f0',
    borderColor: '#FF3B30',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  resultPhone: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
  },
  resultMessage: {
    fontSize: 14,
  },
  successText: {
    color: '#34C759',
  },
  errorText: {
    color: '#FF3B30',
  },
});

export default LoginTester;
