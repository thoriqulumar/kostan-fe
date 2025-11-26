import api from './api';

const expenseService = {
  // Create a new expense
  createExpense: async (expenseData) => {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create expense' };
    }
  },

  // Get all expenses with optional filters
  getAllExpenses: async (filters = {}) => {
    try {
      const params = {};

      if (filters.category) {
        params.category = filters.category;
      }

      if (filters.month) {
        params.month = filters.month;
      }

      if (filters.year) {
        params.year = filters.year;
      }

      const response = await api.get('/expenses', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch expenses' };
    }
  },

  // Get expense by ID
  getExpenseById: async (id) => {
    try {
      const response = await api.get(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch expense' };
    }
  },

  // Update expense
  updateExpense: async (id, expenseData) => {
    try {
      const response = await api.patch(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update expense' };
    }
  },

  // Delete expense
  deleteExpense: async (id) => {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete expense' };
    }
  },

  // Get financial summary (income vs expenses)
  getFinancialSummary: async (month, year) => {
    try {
      const params = {};

      if (month) {
        params.month = month;
      }

      if (year) {
        params.year = year;
      }

      const response = await api.get('/expenses/summary/financial', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch financial summary' };
    }
  },
};

export default expenseService;
