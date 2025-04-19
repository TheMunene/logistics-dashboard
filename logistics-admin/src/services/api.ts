import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logout user if token is invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Order services
export const orderService = {
  getOrders: async (params?: any) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  updateOrder: async (id: string, orderData: any) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },
  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  assignOrder: async (id: string, riderId: string) => {
    const response = await api.post(`/orders/${id}/assign`, { riderId });
    return response.data;
  },
  reportException: async (id: string, exceptionData: any) => {
    const response = await api.post(`/orders/${id}/exception`, exceptionData);
    return response.data;
  },
  resolveException: async (id: string, resolutionData: any) => {
    const response = await api.post(`/orders/${id}/resolve-exception`, resolutionData);
    return response.data;
  },
  getOrderStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
};

// Rider services
export const riderService = {
  getRiders: async (params?: any) => {
    const response = await api.get('/riders', { params });
    return response.data;
  },
  getRiderById: async (id: string) => {
    const response = await api.get(`/riders/${id}`);
    return response.data;
  },
  createRider: async (riderData: any) => {
    const response = await api.post('/riders', riderData);
    return response.data;
  },
  updateRider: async (id: string, riderData: any) => {
    const response = await api.put(`/riders/${id}`, riderData);
    return response.data;
  },
  deleteRider: async (id: string) => {
    const response = await api.delete(`/riders/${id}`);
    return response.data;
  },
  updateRiderLocation: async (id: string, locationData: any) => {
    const response = await api.post(`/riders/${id}/location`, locationData);
    return response.data;
  },
  getRiderOrders: async (id: string, params?: any) => {
    const response = await api.get(`/riders/${id}/orders`, { params });
    return response.data;
  },
  updateRiderStatus: async (id: string, status: string) => {
    const response = await api.post(`/riders/${id}/status`, { status });
    return response.data;
  },
  getRiderStats: async () => {
    const response = await api.get('/riders/stats');
    return response.data;
  },
  getNearbyRiders: async (params: any) => {
    const response = await api.get('/riders/nearby', { params });
    return response.data;
  },
  updateRiderAvailability: async (id: string, availabilityData: any) => {
    const response = await api.post(`/riders/${id}/availability`, { availability: availabilityData });
    return response.data;
  },
};

export default api;