import api from './api';

const userService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Get all users with optional filters
  getAllUsers: async (filters = {}) => {
    try {
      const params = {};

      if (filters.role) {
        params.role = filters.role;
      }

      if (filters.roomStatus) {
        params.roomStatus = filters.roomStatus;
      }

      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  // Get unassigned users with role 'user'
  getUnassignedUsers: async () => {
    try {
      const response = await api.get('/users', {
        params: {
          role: 'user',
          roomStatus: 'unassigned',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch unassigned users' };
    }
  },

  // Get specific user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user' };
    }
  },

  // Toggle user active status
  toggleUserActive: async (id) => {
    try {
      const response = await api.patch(`/users/${id}/toggle-active`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to toggle user status' };
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  },
};

export default userService;
