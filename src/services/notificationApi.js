import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class NotificationApi {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/notifications`,
    });
  }

  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  async getAllNotifications() {
    try {
      const response = await this.client.get('/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getUnreadNotifications() {
    try {
      const response = await this.client.get('/unread');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const response = await this.client.get('/unread/count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await this.client.patch(`/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const response = await this.client.patch('/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

// Export singleton instance
const notificationApi = new NotificationApi();
export default notificationApi;
