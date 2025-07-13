const admin = require('firebase-admin');
const Notification = require('../models/Notification');

// Initialize Firebase Admin SDK
// You need to download your service account key from Firebase Console
const serviceAccount = require('../config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class PushNotificationService {
  /**
   * Send push notification to specific device tokens
   * @param {string[]} tokens - Array of device tokens
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   */
  static async sendToTokens(tokens, notification, data = {}) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.message,
          imageUrl: notification.imageUrl,
        },
        data: {
          notificationId: data.notificationId || '',
          actionUrl: data.actionUrl || '',
          type: data.type || 'info',
          ...data
        },
        tokens: tokens,
        android: {
          notification: {
            channelId: data.priority === 'urgent' ? 'urgent-channel' : 'default-channel',
            priority: data.priority === 'urgent' ? 'high' : 'default',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: data.badge || 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);
      
      console.log('Push notification sent successfully:', response);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error('Failed to send to token:', tokens[idx], resp.error);
          }
        });
        
        // You might want to remove invalid tokens from your database here
        await this.removeInvalidTokens(failedTokens);
      }
      
      return response;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a specific user
   * @param {string} userId - User ID
   * @param {Object} notificationData - Notification data
   */
  static async sendToUser(userId, notificationData) {
    try {
      // Get user's device tokens from database
      const user = await User.findById(userId).select('deviceTokens');
      
      if (!user || !user.deviceTokens || user.deviceTokens.length === 0) {
        console.log('No device tokens found for user:', userId);
        return;
      }

      const tokens = user.deviceTokens.map(dt => dt.token);
      
      // Create notification in database
      const notification = new Notification({
        userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        priority: notificationData.priority || 'medium',
        data: notificationData.data || {},
        actionUrl: notificationData.actionUrl,
        imageUrl: notificationData.imageUrl,
        expiresAt: notificationData.expiresAt,
      });

      await notification.save();

      // Send push notification
      const pushData = {
        notificationId: notification._id.toString(),
        actionUrl: notificationData.actionUrl,
        type: notificationData.type,
        priority: notificationData.priority,
        ...notificationData.data
      };

      await this.sendToTokens(tokens, notification, pushData);
      
      return notification;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  /**
   * Send push notification to multiple users
   * @param {string[]} userIds - Array of user IDs
   * @param {Object} notificationData - Notification data
   */
  static async sendToUsers(userIds, notificationData) {
    try {
      const results = [];
      
      for (const userId of userIds) {
        try {
          const result = await this.sendToUser(userId, notificationData);
          results.push({ userId, success: true, notification: result });
        } catch (error) {
          console.error(`Failed to send notification to user ${userId}:`, error);
          results.push({ userId, success: false, error: error.message });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error sending notifications to users:', error);
      throw error;
    }
  }

  /**
   * Send broadcast notification to all users
   * @param {Object} notificationData - Notification data
   * @param {Object} filters - Optional filters (e.g., user type, location)
   */
  static async sendBroadcast(notificationData, filters = {}) {
    try {
      // Get all users based on filters
      let query = {};
      if (filters.userType) query.userType = filters.userType;
      if (filters.location) query.location = filters.location;
      
      const users = await User.find(query).select('_id');
      const userIds = users.map(user => user._id.toString());
      
      return await this.sendToUsers(userIds, notificationData);
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      throw error;
    }
  }

  /**
   * Schedule a notification to be sent later
   * @param {string} userId - User ID
   * @param {Object} notificationData - Notification data
   * @param {Date} scheduledTime - When to send the notification
   */
  static async scheduleNotification(userId, notificationData, scheduledTime) {
    try {
      // Create notification in database with scheduled time
      const notification = new Notification({
        userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        priority: notificationData.priority || 'medium',
        data: notificationData.data || {},
        actionUrl: notificationData.actionUrl,
        imageUrl: notificationData.imageUrl,
        expiresAt: notificationData.expiresAt,
        scheduledAt: scheduledTime,
        status: 'scheduled'
      });

      await notification.save();
      
      // You would typically use a job queue like Bull or Agenda to schedule this
      // For now, we'll just return the notification
      return notification;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Remove invalid device tokens from database
   * @param {string[]} invalidTokens - Array of invalid tokens
   */
  static async removeInvalidTokens(invalidTokens) {
    try {
      // Remove invalid tokens from all users
      await User.updateMany(
        {},
        { $pull: { deviceTokens: { token: { $in: invalidTokens } } } }
      );
      
      console.log('Removed invalid tokens:', invalidTokens.length);
    } catch (error) {
      console.error('Error removing invalid tokens:', error);
    }
  }

  /**
   * Send notification for specific events
   */
  static async sendEventNotification(eventType, userId, eventData) {
    const notificationTemplates = {
      'points_earned': {
        title: 'Points Earned!',
        message: `You earned ${eventData.points} points!`,
        type: 'success',
        priority: 'medium',
        actionUrl: '/dashboard'
      },
      'points_redeemed': {
        title: 'Points Redeemed',
        message: `You redeemed ${eventData.points} points for ${eventData.item}`,
        type: 'info',
        priority: 'medium',
        actionUrl: '/redeem'
      },
      'profile_updated': {
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated',
        type: 'success',
        priority: 'low',
        actionUrl: '/profile'
      },
      'system_maintenance': {
        title: 'System Maintenance',
        message: 'Scheduled maintenance will begin in 1 hour',
        type: 'warning',
        priority: 'high',
        actionUrl: '/updates'
      }
    };

    const template = notificationTemplates[eventType];
    if (!template) {
      throw new Error(`Unknown event type: ${eventType}`);
    }

    const notificationData = {
      ...template,
      data: eventData
    };

    return await this.sendToUser(userId, notificationData);
  }
}

module.exports = PushNotificationService;
