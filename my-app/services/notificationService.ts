import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API configuration
const API_BASE_URL = 'https://your-api-domain.com/api'; // Replace with your actual API URL

// API client using fetch
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }

    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (response.status === 401) {
        // Handle unauthorized access
        await AsyncStorage.removeItem('authToken');
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion' | 'system';
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  actionUrl?: string;
  imageUrl?: string;
  expiresAt?: string;
  readAt?: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  timeAgo?: string;
  isExpired?: boolean;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
  message?: string;
}

export class NotificationService {
  // Fetch notifications for the current user
  static async getUserNotifications(options: {
    page?: number;
    limit?: number;
    status?: 'read' | 'unread';
    type?: string;
    includeExpired?: boolean;
  } = {}): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();

      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);
      if (options.type) params.append('type', options.type);
      if (options.includeExpired !== undefined) {
        params.append('includeExpired', options.includeExpired.toString());
      }

      const response = await apiClient.get(`/notifications?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  // Get unread notification count
  static async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Mark a specific notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<boolean> {
    try {
      await apiClient.patch('/notifications/mark-all-read');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Create a new notification (for testing or admin purposes)
  static async createNotification(notification: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    priority?: string;
    data?: any;
    actionUrl?: string;
    imageUrl?: string;
    expiresAt?: string;
  }): Promise<Notification | null> {
    try {
      const response = await apiClient.post('/notifications', notification);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Register device token for push notifications
  static async registerDeviceToken(token: string, platform: 'ios' | 'android'): Promise<boolean> {
    try {
      await apiClient.post('/notifications/register-device', {
        token,
        platform,
      });
      return true;
    } catch (error) {
      console.error('Error registering device token:', error);
      return false;
    }
  }

  // Unregister device token
  static async unregisterDeviceToken(token: string): Promise<boolean> {
    try {
      await apiClient.post('/notifications/unregister-device', { token });
      return true;
    } catch (error) {
      console.error('Error unregistering device token:', error);
      return false;
    }
  }

  // Update notification preferences
  static async updateNotificationPreferences(preferences: {
    enablePush?: boolean;
    enableEmail?: boolean;
    types?: string[];
  }): Promise<boolean> {
    try {
      await apiClient.patch('/notifications/preferences', preferences);
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }
}

export default NotificationService;
