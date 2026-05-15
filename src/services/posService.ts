import api from './api';
import { Product, OrderRequest } from '../types';

export const productService = {
  getProducts: async () => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },
  searchProducts: async (query: string) => {
    // Note: Assuming the search endpoint is /products/search?q=...
    const response = await api.get<Product[]>(`/products/search?q=${query}`);
    return response.data;
  },
};

export const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  createOrder: async (order: OrderRequest) => {
    const response = await api.post('/orders', order);
    return response.data;
  },
};

export const paymentService = {
  generateQR: (amount: number, phone: string) => {
    const baseURL = import.meta.env.DEV ? '/api' : 'https://possimon.onrender.com/api';
    return `${baseURL}/payments/generate-qr?amount=${amount}&phone=${phone}`;
  },
  getQRBlob: async (amount: number, phone: string) => {
    const response = await api.get(`/payments/generate-qr?amount=${amount}&phone=${phone}`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  }
};

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  loginWeb: async (credentials: any) => {
    // This endpoint is expected to redirect to /auth/success?token=...
    // In a SPA, if we use axios, it will follow the redirect.
    // We might need to handle the redirect manually if we want the browser URL to change.
    const response = await api.post('/auth/login/web', credentials);
    return response;
  },
  loginPOS: async (credentials: any) => {
    // This endpoint returns JSON {"access_token": "..."} directly
    const response = await api.post('/auth/login/pos', credentials);
    return response.data;
  }
};
