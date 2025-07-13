import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LoginTester from '../components/LoginTester';

export default function TestLoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LoginTester />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
