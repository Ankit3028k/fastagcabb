import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

// Initialize notifications
export const initNotifications = () => {
  PushNotification.configure({
    onRegister: async function(token) {
      await AsyncStorage.setItem('pushToken', token.token);
      console.log('TOKEN:', token);
    },
    onNotification: function(notification) {
      console.log('NOTIFICATION:', notification);
      // Required on iOS only
      notification.finish(Platform.OS === 'ios' ? PushNotificationIOS.FetchResult.NoData : '');
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: true,
  });
};

// Create a local notification
export const createLocalNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: "default-channel",
    title: title,
    message: message,
    playSound: true,
    soundName: "default",
  });
};