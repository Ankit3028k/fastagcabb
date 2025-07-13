# Notification System Setup Guide

This guide will help you set up the complete notification system with MongoDB integration, push notifications, and React Native components.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Setup](#mongodb-setup)
3. [Backend Setup](#backend-setup)
4. [React Native Setup](#react-native-setup)
5. [Firebase Setup (for Push Notifications)](#firebase-setup)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- React Native development environment
- Firebase account (for push notifications)
- Expo CLI (if using Expo)

## 🗄️ MongoDB Setup

### 1. Install MongoDB

```bash
# On macOS using Homebrew
brew install mongodb-community

# On Ubuntu
sudo apt-get install mongodb

# On Windows
# Download from https://www.mongodb.com/try/download/community
```

### 2. Start MongoDB

```bash
# Start MongoDB service
mongod

# Or if using Homebrew on macOS
brew services start mongodb-community
```

### 3. Create Database and Collections

```javascript
// Connect to MongoDB
use your_app_database

// Create notifications collection with indexes
db.notifications.createIndex({ "userId": 1, "createdAt": -1 })
db.notifications.createIndex({ "userId": 1, "status": 1 })
db.notifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

## 🖥️ Backend Setup

### 1. Install Dependencies

```bash
npm install express mongoose firebase-admin cors helmet
npm install --save-dev nodemon
```

### 2. Environment Variables

Create a `.env` file in your backend directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/your_app_database

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id

# Server
PORT=3000
NODE_ENV=development
```

### 3. Server Setup

Create `server.js`:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const notificationRoutes = require('./api/notificationRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/notifications', notificationRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 4. Authentication Middleware

Create `middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

## 📱 React Native Setup

### 1. Install Dependencies

```bash
npm install @react-native-async-storage/async-storage
npm install react-native-push-notification
npm install @react-native-community/push-notification-ios  # iOS only
```

**Note**: This implementation uses the native `fetch` API instead of axios for better React Native compatibility.

### 2. Android Configuration

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>

<receiver android:name="com.dieam.reactnativepushnotification.modules.RNPushNotificationBootEventReceiver">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```

### 3. iOS Configuration

Add to `ios/YourApp/AppDelegate.m`:

```objc
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

// Add this to the top of AppDelegate.m
@interface AppDelegate () <UNUserNotificationCenterDelegate>
@end

// Add these methods
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void(^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}
```

### 4. Update API Base URL

In `services/notificationService.ts`, update the API_BASE_URL:

```typescript
const API_BASE_URL = 'http://your-server-domain.com/api'; // Replace with your actual API URL
// For local development: 'http://localhost:3000/api'
// For Android emulator: 'http://10.0.2.2:3000/api'
```

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Cloud Messaging

### 2. Generate Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `config/firebase-service-account.json` in your backend

### 3. Get FCM Server Key

1. Go to Project Settings > Cloud Messaging
2. Copy the Server Key
3. Add it to your environment variables

### 4. Configure React Native

For Expo projects, add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

## 🧪 Testing

### 1. Test Backend API

```bash
# Start your backend server
npm run dev

# Test notification creation
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user123",
    "title": "Test Notification",
    "message": "This is a test notification",
    "type": "info"
  }'
```

### 2. Test React Native App

1. Start your React Native app
2. Navigate to the notifications screen
3. Check if notifications are displayed
4. Test marking notifications as read
5. Test push notification functionality

### 3. Test Push Notifications

```javascript
// In your backend, send a test notification
const PushNotificationService = require('./services/pushNotificationBackend');

await PushNotificationService.sendToUser('user123', {
  title: 'Test Push Notification',
  message: 'This is a test push notification',
  type: 'info',
  actionUrl: '/notifications'
});
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in environment variables

2. **Push Notifications Not Working**
   - Verify Firebase configuration
   - Check device permissions
   - Ensure FCM server key is correct

3. **API Calls Failing**
   - Check network connectivity
   - Verify API base URL
   - Ensure authentication tokens are valid

4. **Notifications Not Displaying**
   - Check notification permissions
   - Verify data format
   - Check console for errors

### Debug Commands

```bash
# Check MongoDB status
mongod --version

# Check React Native logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS

# Check backend logs
npm run dev  # Should show server logs
```

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [React Native Push Notifications](https://github.com/zo0r/react-native-push-notification)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

## 🤝 Support

If you encounter any issues, please check the troubleshooting section or create an issue in the project repository.
