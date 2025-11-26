import api from './api';

const roomService = {
  // Get all rooms
  getAllRooms: async () => {
    try {
      const response = await api.get('/rooms');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch rooms' };
    }
  },

  // Create new room
  createRoom: async (name, price) => {
    try {
      const response = await api.post('/rooms', {
        name,
        price,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create room' };
    }
  },

  // Update room
  updateRoom: async (id, roomData) => {
    try {
      const response = await api.put(`/rooms/${id}`, roomData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update room' };
    }
  },

  // Delete room
  deleteRoom: async (id) => {
    try {
      const response = await api.delete(`/rooms/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete room' };
    }
  },

  // Assign user to room
  assignUserToRoom: async (roomId, userId, rentStartDate) => {
    try {
      const room = await api.get(`/rooms`);
      const roomData = room.data.find((r) => r.id === roomId);

      const response = await api.put(`/rooms/${roomId}`, {
        name: roomData.name,
        price: roomData.price,
        rentedUserId: userId,
        rentStartDate: rentStartDate || new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to assign user to room' };
    }
  },

  // Remove user from room
  removeUserFromRoom: async (roomId) => {
    try {
      const room = await api.get(`/rooms`);
      const roomData = room.data.find((r) => r.id === roomId);

      const response = await api.put(`/rooms/${roomId}`, {
        name: roomData.name,
        price: roomData.price,
        rentedUserId: null,
        rentStartDate: null,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove user from room' };
    }
  },
};

export default roomService;
