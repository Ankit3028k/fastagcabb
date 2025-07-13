// Example usage of the notification system

import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNotifications } from '@/contexts/NotificationContext';
import pushNotificationManager from '@/services/pushNotificationService';

// Example component showing how to use notifications
export function NotificationExample() {
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead,
    markAllAsRead 
  } = useNotifications();

  useEffect(() => {
    // Initialize push notifications when component mounts
    initializePushNotifications();
    
    // Fetch initial notifications
    fetchNotifications(true);
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Request permissions
      const hasPermission = await pushNotificationManager.requestPermissions();
      
      if (hasPermission) {
        console.log('Push notification permissions granted');
        
        // Show a test local notification
        pushNotificationManager.showLocalNotification({
          title: 'Welcome!',
          message: 'Push notifications are now enabled',
          data: { actionUrl: '/notifications' }
        });
      } else {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive updates.'
        );
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  // Example of handling notification click
  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      // Navigate to specific screen based on notification data
      // This would typically be handled by the push notification service
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return null; // This is just an example component
}

// Backend API usage examples

// 1. Creating a notification (backend)
/*
const PushNotificationService = require('./services/pushNotificationBackend');

// Send notification to a specific user
await PushNotificationService.sendToUser('user123', {
  title: 'Points Earned!',
  message: 'You earned 50 points for completing a task',
  type: 'success',
  priority: 'medium',
  actionUrl: '/dashboard',
  data: { points: 50, taskId: 'task456' }
});

// Send notification to multiple users
await PushNotificationService.sendToUsers(['user1', 'user2', 'user3'], {
  title: 'New Feature Available',
  message: 'Check out our new QR scanner feature!',
  type: 'info',
  priority: 'low',
  actionUrl: '/features'
});

// Send broadcast notification
await PushNotificationService.sendBroadcast({
  title: 'System Maintenance',
  message: 'Scheduled maintenance will begin at 2 AM',
  type: 'warning',
  priority: 'high',
  actionUrl: '/updates'
});

// Send event-based notification
await PushNotificationService.sendEventNotification('points_earned', 'user123', {
  points: 100,
  source: 'QR_SCAN'
});
*/

// 2. Frontend API usage examples
/*
import NotificationService from '@/services/notificationService';

// Fetch user notifications
const notifications = await NotificationService.getUserNotifications({
  page: 1,
  limit: 20,
  status: 'unread'
});

// Get unread count
const unreadCount = await NotificationService.getUnreadCount();

// Mark notification as read
await NotificationService.markAsRead('notification123');

// Mark all as read
await NotificationService.markAllAsRead();

// Delete notification
await NotificationService.deleteNotification('notification123');
*/

// 3. Express.js route setup example
/*
const express = require('express');
const notificationRoutes = require('./api/notificationRoutes');

const app = express();

// Use notification routes
app.use('/api/notifications', notificationRoutes);

// Example of triggering a notification from another route
app.post('/api/user/complete-task', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId, points } = req.body;
    
    // Complete the task logic here...
    
    // Send notification
    await PushNotificationService.sendEventNotification('points_earned', userId, {
      points,
      taskId,
      source: 'TASK_COMPLETION'
    });
    
    res.json({ success: true, message: 'Task completed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
*/

// 4. MongoDB connection and model usage
/*
const mongoose = require('mongoose');
const Notification = require('./models/Notification');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your-app-db');

// Create a notification directly
const notification = new Notification({
  userId: 'user123',
  title: 'Welcome!',
  message: 'Welcome to our app',
  type: 'info',
  priority: 'medium'
});

await notification.save();

// Query notifications
const userNotifications = await Notification.getUserNotifications('user123', {
  page: 1,
  limit: 10
});

// Get unread count
const unreadCount = await Notification.getUnreadCount('user123');

// Mark all as read
await Notification.markAllAsRead('user123');
*/

// 5. React Native component integration
/*
import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNotifications } from '@/contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

export function NotificationsList() {
  const { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead,
    deleteNotification 
  } = useNotifications();

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => markAsRead(item._id)}
    >
      <Ionicons 
        name={item.status === 'unread' ? 'mail-unread' : 'mail'} 
        size={24} 
        color={item.status === 'unread' ? '#007AFF' : '#666'} 
      />
      <View style={styles.notificationContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.timeAgo}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteNotification(item._id)}>
        <Ionicons name="trash" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={(item) => item._id}
      onRefresh={() => fetchNotifications(true)}
      refreshing={isLoading}
    />
  );
}
*/

// 6. Push notification configuration for different platforms
/*
// For iOS (in your iOS project's AppDelegate.m or AppDelegate.swift)
// Add the following to handle notification clicks:

// AppDelegate.m
- (void)userNotificationCenter:(UNUserNotificationCenter *)center 
didReceiveNotificationResponse:(UNNotificationResponse *)response 
         withCompletionHandler:(void(^)(void))completionHandler {
  
  NSDictionary *userInfo = response.notification.request.content.userInfo;
  NSString *actionUrl = userInfo[@"actionUrl"];
  
  if (actionUrl) {
    // Navigate to the specified URL
    [[NSNotificationCenter defaultCenter] postNotificationName:@"NotificationClicked" 
                                                        object:nil 
                                                      userInfo:userInfo];
  }
  
  completionHandler();
}

// For Android (in your android/app/src/main/AndroidManifest.xml)
// Add intent filters for notification handling:

<activity
  android:name=".MainActivity"
  android:launchMode="singleTask">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="yourapp" />
  </intent-filter>
</activity>
*/

export default NotificationExample;
