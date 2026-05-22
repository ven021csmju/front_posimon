import api from "../../../services/api";

export const receiptService = {
  // Add receipt specific API calls here if needed, 
  // e.g., fetching a receipt by order ID for re-printing
  getReceiptData: async (orderId: string | number) => {
    const response = await api.get(`/orders/${orderId}/receipt`);
    return response.data;
  },
};
