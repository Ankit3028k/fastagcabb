// Test file for notification service
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/notificationService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mock-token');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            _id: '1',
            title: 'Test Notification',
            message: 'Test message',
            type: 'info',
            status: 'unread',
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await NotificationService.getUserNotifications({
        page: 1,
        limit: 20,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications?page=1&limit=20'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle fetch errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        NotificationService.getUserNotifications()
      ).rejects.toThrow('Failed to fetch notifications');
    });

    it('should handle HTTP errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        NotificationService.getUserNotifications()
      ).rejects.toThrow('Failed to fetch notifications');
    });

    it('should handle unauthorized errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(
        NotificationService.getUserNotifications()
      ).rejects.toThrow('Failed to fetch notifications');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread count successfully', async () => {
      const mockResponse = { success: true, count: 5 };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await NotificationService.getUnreadCount();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/unread-count'),
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toBe(5);
    });

    it('should return 0 on error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await NotificationService.getUnreadCount();
      expect(result).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const result = await NotificationService.markAsRead('notification-id');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/notification-id/read'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await NotificationService.markAsRead('notification-id');
      expect(result).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const result = await NotificationService.markAllAsRead();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/mark-all-read'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      expect(result).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const result = await NotificationService.deleteNotification('notification-id');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/notification-id'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      expect(result).toBe(true);
    });
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      const mockNotification = {
        _id: 'new-id',
        title: 'New Notification',
        message: 'New message',
        type: 'info',
        status: 'unread',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ success: true, data: mockNotification }),
      });

      const notificationData = {
        userId: 'user-id',
        title: 'New Notification',
        message: 'New message',
      };

      const result = await NotificationService.createNotification(notificationData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(notificationData),
        })
      );

      expect(result).toEqual(mockNotification);
    });
  });
});
