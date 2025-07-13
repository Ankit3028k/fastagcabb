import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NotificationService, { Notification } from '@/services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: (refresh?: boolean) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  clearError: () => void;
  
  // Pagination
  hasMoreNotifications: boolean;
  currentPage: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);

  const NOTIFICATIONS_PER_PAGE = 20;

  // Fetch notifications
  const fetchNotifications = async (refresh = false) => {
    if (!user) return;

    try {
      if (refresh) {
        setIsRefreshing(true);
        setCurrentPage(1);
      } else {
        setIsLoading(true);
      }
      
      setError(null);

      const response = await NotificationService.getUserNotifications({
        page: refresh ? 1 : currentPage,
        limit: NOTIFICATIONS_PER_PAGE,
      });

      if (response.success) {
        if (refresh) {
          setNotifications(response.data);
          setCurrentPage(2);
        } else {
          setNotifications(response.data);
          setCurrentPage(2);
        }
        
        // Check if there are more notifications
        setHasMoreNotifications(
          response.pagination ? 
          response.pagination.page < response.pagination.totalPages : 
          response.data.length === NOTIFICATIONS_PER_PAGE
        );
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load more notifications (pagination)
  const loadMoreNotifications = async () => {
    if (!user || isLoading || !hasMoreNotifications) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await NotificationService.getUserNotifications({
        page: currentPage,
        limit: NOTIFICATIONS_PER_PAGE,
      });

      if (response.success) {
        setNotifications(prev => [...prev, ...response.data]);
        setCurrentPage(prev => prev + 1);
        
        // Check if there are more notifications
        setHasMoreNotifications(
          response.pagination ? 
          response.pagination.page < response.pagination.totalPages : 
          response.data.length === NOTIFICATIONS_PER_PAGE
        );
      }
    } catch (err) {
      setError('Failed to load more notifications');
      console.error('Error loading more notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const success = await NotificationService.markAsRead(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, status: 'read', readAt: new Date().toISOString() }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const success = await NotificationService.markAllAsRead();
      if (success) {
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            status: 'read' as const,
            readAt: notification.status === 'unread' ? new Date().toISOString() : notification.readAt
          }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const success = await NotificationService.deleteNotification(notificationId);
      if (success) {
        const deletedNotification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        
        // Update unread count if deleted notification was unread
        if (deletedNotification?.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Refresh unread count
  const refreshUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error refreshing unread count:', err);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Handle app state changes to refresh notifications
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && user) {
        refreshUnreadCount();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [user]);

  // Initial load when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications(true);
      refreshUnreadCount();
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setCurrentPage(1);
      setHasMoreNotifications(true);
    }
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    error,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
    clearError,
    hasMoreNotifications,
    currentPage,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
