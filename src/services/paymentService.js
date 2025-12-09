import api from "./api";

const paymentService = {
  // Upload payment receipt
  uploadReceipt: async (file, paymentMonth, paymentYear, amount, description) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("paymentMonth", paymentMonth);
      formData.append("paymentYear", paymentYear);
      formData.append("amount", amount);
      if (description) {
        formData.append("description", description);
      }

      const response = await api.post("/payments/upload-receipt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to upload receipt" };
    }
  },

  // Get user's payment history
  getMyPayments: async () => {
    try {
      const response = await api.get("/payments/my-payments");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch payment history" }
      );
    }
  },

  // Get pending payments (Admin only)
  getPendingPayments: async () => {
    try {
      const response = await api.get("/payments/pending");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch pending payments" }
      );
    }
  },

  // Get all payments (Admin only)
  getAllPayments: async () => {
    try {
      const response = await api.get("/payments/all");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch all payments" };
    }
  },

  // Get payment by ID (Admin only)
  getPaymentById: async (id) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch payment details" }
      );
    }
  },

  // Approve payment (Admin only)
  approvePayment: async (id) => {
    try {
      const response = await api.post(`/payments/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to approve payment" };
    }
  },

  // Reject payment (Admin only)
  rejectPayment: async (id, rejectionReason) => {
    try {
      const response = await api.post(`/payments/${id}/reject`, {
        rejectionReason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to reject payment" };
    }
  },

  // Get receipt image by payment ID
  getReceiptImage: async (id) => {
    try {
      const response = await api.get(`/payments/receipt/${id}/image`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch receipt image" }
      );
    }
  },

  // Delete payment receipt
  deleteReceipt: async (id) => {
    try {
      const response = await api.delete(`/payments/receipt/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete receipt" };
    }
  },

  // Get income report (Admin only)
  getIncomeReport: async (year) => {
    try {
      const response = await api.get("/payments/income/report", {
        params: { year },
      });
      console.log({ response });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch income report" }
      );
    }
  },

  // Get income summary (Admin only)
  getIncomeSummary: async (year) => {
    try {
      const response = await api.get("/payments/income/summary", {
        params: { year },
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch income summary" }
      );
    }
  },

};

export default paymentService;
