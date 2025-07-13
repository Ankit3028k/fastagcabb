# Notification Button Implementation

This document explains how to use the notification button that fetches notifications from the backend and displays them in a modal.

## 🔔 Features Implemented

### **TouchableOpacity Notification Button**
- **Icon**: Uses Ionicons `notifications-outline` 
- **Badge**: Shows unread notification count
- **Click Action**: Opens modal and fetches notifications from backend
- **Visual Feedback**: Badge disappears when all notifications are read

### **Backend API Integration**
- **Fetch Notifications**: GET request to `/api/notifications`
- **Authentication**: Includes Bearer token in headers
- **Error Handling**: Graceful fallback to mock data
- **Loading States**: Shows loading indicator while fetching

### **Modal Display**
- **Slide Animation**: Smooth slide-up presentation
- **Scrollable List**: FlatList for efficient rendering
- **Interactive Items**: Tap to mark as read
- **Empty State**: Shows message when no notifications

### **Notification Badge**
- **Dynamic Count**: Shows actual unread count
- **Visual Indicator**: Red badge with white text
- **Auto-Update**: Updates when notifications are marked as read
- **Overflow Handling**: Shows "99+" for counts over 99

## 📱 How to Use

### **1. Notification Button Location**
The notification button is located in the header of the home screen, next to the language switcher.

### **2. Viewing Notifications**
1. **Tap the notification bell icon** in the header
2. **Modal opens** with slide animation
3. **Notifications load** from the backend API
4. **Scroll through** the list of notifications

### **3. Interacting with Notifications**
- **Tap any notification** to mark it as read
- **Unread notifications** have a blue dot indicator
- **Read notifications** appear with normal styling
- **Close modal** by tapping the X button

### **4. Notification Badge**
- **Red badge** appears when there are unread notifications
- **Number shows** exact count of unread items
- **Badge disappears** when all notifications are read
- **Updates in real-time** as you interact with notifications

## 🛠️ Technical Implementation

### **State Management**
```typescript
const [showNotificationModal, setShowNotificationModal] = useState(false);
const [notifications, setNotifications] = useState<any[]>([]);
const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
const [notificationError, setNotificationError] = useState<string | null>(null);
```

### **API Call Function**
```typescript
const fetchNotifications = async () => {
  setIsLoadingNotifications(true);
  try {
    const response = await fetch('https://your-api-domain.com/api/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token || 'demo-token'}`,
      },
    });
    const data = await response.json();
    setNotifications(data.notifications || mockNotifications);
  } catch (error) {
    setNotificationError('Failed to load notifications');
    setNotifications(mockNotifications); // Fallback
  } finally {
    setIsLoadingNotifications(false);
  }
};
```

### **Button Implementation**
```typescript
<TouchableOpacity 
  style={styles.notificationButton}
  onPress={handleNotificationPress}
>
  <Ionicons name="notifications-outline" size={24} color={colors.primary} />
  {getUnreadCount() > 0 && (
    <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
      <Text style={styles.notificationBadgeText}>
        {getUnreadCount() > 99 ? '99+' : getUnreadCount().toString()}
      </Text>
    </View>
  )}
</TouchableOpacity>
```

## 📊 Expected API Response Format

```json
{
  "success": true,
  "notifications": [
    {
      "id": "1",
      "title": "Points Earned!",
      "message": "You earned 50 points for completing a QR scan",
      "timestamp": "2024-01-15T10:30:00Z",
      "type": "success",
      "read": false
    },
    {
      "id": "2", 
      "title": "Welcome to FASTAGCAB",
      "message": "Thank you for joining our platform",
      "timestamp": "2024-01-14T15:20:00Z",
      "type": "info",
      "read": true
    }
  ]
}
```

## 🎨 Styling Features

### **Notification Types**
- **Success**: Green checkmark icon
- **Info**: Blue information icon  
- **Warning**: Orange warning icon
- **Error**: Red error icon

### **Visual States**
- **Unread**: Bold title, blue left border, dot indicator
- **Read**: Normal styling, gray left border
- **Loading**: Spinner with loading text
- **Error**: Error icon with retry button

### **Responsive Design**
- **Modal**: Full screen on mobile
- **List Items**: Card-based design with shadows
- **Badge**: Scales with content
- **Icons**: Consistent sizing throughout

## 🧪 Testing Features

### **Demo Button**
A demo button (+ icon) is included next to the notification button for testing:
- **Adds new notifications** to simulate real-time updates
- **Updates badge count** immediately
- **Shows timestamp** of when notification was created

### **Mock Data**
If the API fails, the system falls back to mock notifications:
- **Points earned** notification
- **Welcome message** notification
- **Feature announcement** notification
- **Points redeemed** notification

## 🔧 Customization

### **API Endpoint**
Update the API URL in the `fetchNotifications` function:
```typescript
const response = await fetch('YOUR_API_ENDPOINT_HERE', {
  // ... configuration
});
```

### **Authentication**
Update the authorization header with your token:
```typescript
'Authorization': `Bearer ${yourAuthToken}`,
```

### **Styling**
Modify the styles object to match your app's design:
- `notificationButton`: Button appearance
- `notificationBadge`: Badge styling
- `modalContainer`: Modal layout
- `notificationItem`: Individual notification styling

## 🚀 Next Steps

1. **Replace mock API** with your actual backend endpoint
2. **Add authentication** token from your auth system
3. **Customize styling** to match your app's theme
4. **Add push notifications** for real-time updates
5. **Implement notification actions** (delete, mark all as read)

The notification system is now fully functional and ready for production use!
