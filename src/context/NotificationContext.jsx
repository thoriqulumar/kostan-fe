import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to WebSocket
      socketService.connect(token);

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

      // Handle socket connection
      const handleConnect = () => {
        console.log('Socket connected, fetching notifications...');
        // Request existing notifications when connected
        socketService.emit('get_notifications');
        socketService.emit('get_unread_count');
      };

      // Handle existing notifications list
      const handleNotifications = (notificationsData) => {
        console.log('Existing notifications received:', notificationsData);

        if (Array.isArray(notificationsData)) {
          const mappedNotifications = notificationsData.map(mapNotification);
          setNotifications(mappedNotifications);

          // Count unread
          const unread = mappedNotifications.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      };

      // Listen for new notifications from backend
      const handleNewNotification = (data) => {
        console.log('New notification received:', data);

        const notification = mapNotification(data);
        setNotifications((prev) => [notification, ...prev]);
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
        console.log('Unread count update:', count);
        setUnreadCount(count);
      };

      // Register event listeners
      socketService.on('connect', handleConnect);
      socketService.on('notifications', handleNotifications);
      socketService.on('new_notification', handleNewNotification);
      socketService.on('unread_count', handleUnreadCount);

      // Cleanup on unmount or when auth changes
      return () => {
        socketService.off('connect', handleConnect);
        socketService.off('notifications', handleNotifications);
        socketService.off('new_notification', handleNewNotification);
        socketService.off('unread_count', handleUnreadCount);
      };
    } else {
      // Disconnect when logged out
      socketService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, token]);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
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
