import { useAuth } from '@/contexts/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasNavigated, setHasNavigated] = useState(false);

  console.log("server url is",process.env.EXPO_PUBLIC_API_URL);
  console.log("environment is ", process.env.NODE_ENV);
  useFocusEffect(
    useCallback(() => {
      if (!isLoading && !hasNavigated) {
        setHasNavigated(true);

        // Use requestAnimationFrame to ensure the layout is ready
        requestAnimationFrame(() => {
          if (isAuthenticated) {
            router.replace('/(tabs)');
          } else {
            router.replace('/login');
          }
        });
      }
    }, [isAuthenticated, isLoading, hasNavigated])
  );

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
