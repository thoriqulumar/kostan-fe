import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import sseService from '../services/sseService';
import notificationApi from '../services/notificationApi';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Set auth token for API requests
      notificationApi.setAuthToken(token);

      // Map backend notification to frontend format
      const mapNotification = (data) => ({
        id: data.id || Date.now(),
        type: data.type === 'PAYMENT_APPROVED' ? 'success' :
              data.type === 'PAYMENT_REJECTED' ? 'error' :
              data.type === 'PAYMENT_REMINDER' ? 'warning' : 'info',
        title: data.title,
        message: data.message,
        timestamp: data.createdAt || new Date(),
        read: data.isRead || false,
      });

      // Fetch initial notifications via REST API
      const fetchInitialNotifications = async () => {
        try {
          const notificationsData = await notificationApi.getAllNotifications();
          console.log('Initial notifications fetched:', notificationsData);

          if (Array.isArray(notificationsData)) {
            const mappedNotifications = notificationsData.map(mapNotification);
            setNotifications(mappedNotifications);

            // Count unread
            const unread = mappedNotifications.filter(n => !n.read).length;
            setUnreadCount(unread);
          }
        } catch (error) {
          console.error('Error fetching initial notifications:', error);
        }
      };

      // Handle SSE connection
      const handleConnect = () => {
        console.log('🟢 [NotificationContext] SSE connected, fetching notifications...');
        fetchInitialNotifications();
      };

      // Listen for new notifications from SSE
      const handleNewNotification = (data) => {
        console.log('🔔 [NotificationContext] New notification received:', data);

        const notification = mapNotification(data);
        console.log('📝 [NotificationContext] Mapped notification:', notification);
        setNotifications((prev) => {
          console.log('📋 [NotificationContext] Adding to notifications. Current count:', prev.length);
          return [notification, ...prev];
        });
        setUnreadCount((prev) => prev + 1);

        // Show toast notification based on type
        if (notification.type === 'success') {
          toast.success(notification.message, {
            duration: 5000,
            icon: '✅',
          });
        } else if (notification.type === 'error') {
          toast.error(notification.message, {
            duration: 6000,
            icon: '❌',
          });
        } else if (notification.type === 'warning') {
          toast(notification.message, {
            duration: 5000,
            icon: '⚠️',
          });
        } else {
          toast(notification.message, {
            duration: 4000,
            icon: '🔔',
          });
        }
      };

      const handleUnreadCount = (count) => {
        console.log('📬 [NotificationContext] Unread count update:', count);
        setUnreadCount(count);
      };

      // Connect to SSE
      sseService.connect(token);

      // Register event listeners
      sseService.on('connect', handleConnect);
      sseService.on('new_notification', handleNewNotification);
      sseService.on('unread_count', handleUnreadCount);

      // Cleanup on unmount or when auth changes
      return () => {
        sseService.off('connect', handleConnect);
        sseService.off('new_notification', handleNewNotification);
        sseService.off('unread_count', handleUnreadCount);
        sseService.disconnect();
      };
    } else {
      // Disconnect when logged out
      sseService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, token]);

  const markAsRead = async (notificationId) => {
    try {
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Send API request
      await notificationApi.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: false } : notif
        )
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      const previousNotifications = [...notifications];
      const previousUnreadCount = unreadCount;

      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);

      // Send API request
      await notificationApi.markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  };

  const clearNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
