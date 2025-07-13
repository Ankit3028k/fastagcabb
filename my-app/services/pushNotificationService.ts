import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import NotificationService from './notificationService';

export interface PushNotificationData {
  notificationId?: string;
  actionUrl?: string;
  type?: string;
  userId?: string;
}

class PushNotificationManager {
  private isInitialized = false;
  private deviceToken: string | null = null;

  constructor() {
    this.configure();
  }

  private configure() {
    if (this.isInitialized) return;

    PushNotification.configure({
      // Called when Token is generated (iOS and Android)
      onRegister: (token) => {
        console.log('Push notification token:', token);
        this.deviceToken = token.token;
        this.saveDeviceToken(token.token);
        this.registerTokenWithServer(token.token);
      },

      // Called when a remote is received or opened, or local notification is opened
      onNotification: (notification) => {
        console.log('Push notification received:', notification);
        this.handleNotification(notification);
      },

      // Called when a remote is received or opened, or local notification is opened
      onAction: (notification) => {
        console.log('Push notification action:', notification);
        this.handleNotificationAction(notification);
      },

      // Called when the user fails to register for remote notifications
      onRegistrationError: (err) => {
        console.error('Push notification registration error:', err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      // (optional) default: true
      requestPermissions: Platform.OS === 'ios',
    });

    // Create default channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'default-channel',
          channelName: 'Default Channel',
          channelDescription: 'Default notification channel',
          playSound: true,
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`Default channel created: ${created}`)
      );

      // Create high priority channel for urgent notifications
      PushNotification.createChannel(
        {
          channelId: 'urgent-channel',
          channelName: 'Urgent Notifications',
          channelDescription: 'High priority notifications',
          playSound: true,
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`Urgent channel created: ${created}`)
      );
    }

    this.isInitialized = true;
  }

  private async saveDeviceToken(token: string) {
    try {
      await AsyncStorage.setItem('deviceToken', token);
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  }

  private async registerTokenWithServer(token: string) {
    try {
      const platform = Platform.OS as 'ios' | 'android';
      await NotificationService.registerDeviceToken(token, platform);
    } catch (error) {
      console.error('Error registering token with server:', error);
    }
  }

  private handleNotification(notification: any) {
    const { data, userInteraction } = notification;
    
    // If user tapped on the notification
    if (userInteraction) {
      this.navigateToNotification(data);
    }
    
    // Update badge count (iOS)
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(notification.badge || 0);
    }
  }

  private handleNotificationAction(notification: any) {
    const { action, data } = notification;
    
    switch (action) {
      case 'view':
        this.navigateToNotification(data);
        break;
      case 'mark_read':
        if (data.notificationId) {
          NotificationService.markAsRead(data.notificationId);
        }
        break;
      default:
        this.navigateToNotification(data);
    }
  }

  private navigateToNotification(data: PushNotificationData) {
    if (data.actionUrl) {
      // Navigate to specific screen
      router.push(data.actionUrl as any);
    } else {
      // Navigate to notifications screen
      router.push('/notifications');
    }
  }

  // Request permissions for notifications
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // Android < 13 doesn't need explicit permission
    } else {
      // iOS permissions are handled in configure()
      return new Promise((resolve) => {
        PushNotification.requestPermissions((permissions) => {
          resolve(permissions.alert && permissions.badge && permissions.sound);
        });
      });
    }
  }

  // Show local notification
  showLocalNotification(options: {
    title: string;
    message: string;
    data?: PushNotificationData;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actions?: string[];
  }) {
    const { title, message, data = {}, priority = 'medium', actions } = options;
    
    const channelId = priority === 'urgent' ? 'urgent-channel' : 'default-channel';
    
    PushNotification.localNotification({
      title,
      message,
      data,
      channelId,
      actions,
      invokeApp: true,
      userInfo: data,
      playSound: true,
      soundName: 'default',
      number: 1,
    });
  }

  // Schedule local notification
  scheduleLocalNotification(options: {
    title: string;
    message: string;
    date: Date;
    data?: PushNotificationData;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) {
    const { title, message, date, data = {}, priority = 'medium' } = options;
    
    const channelId = priority === 'urgent' ? 'urgent-channel' : 'default-channel';
    
    PushNotification.localNotificationSchedule({
      title,
      message,
      date,
      data,
      channelId,
      userInfo: data,
      playSound: true,
      soundName: 'default',
    });
  }

  // Cancel all local notifications
  cancelAllLocalNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Cancel specific notification
  cancelLocalNotification(notificationId: string) {
    PushNotification.cancelLocalNotifications({ id: notificationId });
  }

  // Get device token
  getDeviceToken(): string | null {
    return this.deviceToken;
  }

  // Set badge number (iOS)
  setBadgeNumber(number: number) {
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(number);
    }
  }

  // Clear badge (iOS)
  clearBadge() {
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(0);
    }
  }

  // Unregister device token
  async unregisterDevice() {
    try {
      if (this.deviceToken) {
        await NotificationService.unregisterDeviceToken(this.deviceToken);
        await AsyncStorage.removeItem('deviceToken');
        this.deviceToken = null;
      }
    } catch (error) {
      console.error('Error unregistering device:', error);
    }
  }
}

// Create singleton instance
const pushNotificationManager = new PushNotificationManager();

export default pushNotificationManager;
