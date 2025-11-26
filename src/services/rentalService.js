import api from './api';

const rentalService = {
  // Get current user's rented room
  getMyRoom: async () => {
    try {
      const response = await api.get('/rentals/my-room');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch room' };
    }
  },

  // Admin: Assign user to room
  assignUserToRoom: async (roomId, userId, rentStartDate) => {
    try {
      const response = await api.post('/rentals', {
        roomId,
        userId,
        rentStartDate,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to assign room' };
    }
  },

  // Admin: Unassign user from room
  unassignUserFromRoom: async (userId) => {
    try {
      const response = await api.post('/rentals/unassign', {
        userId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to unassign room' };
    }
  },
};

export default rentalService;
