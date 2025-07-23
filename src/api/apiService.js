import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5001/api'
    : 'http://localhost:5001/api';
// const API_URL = 'https://agrigrow-backend.onrender.com/api';

console.log('Platform:', Platform.OS);
console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url);
    console.log('Request headers:', config.headers);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => {
    console.log(
      'Response from:',
      response.config.url,
      'Status:',
      response.status,
    );
    return response;
  },
  error => {
    console.error('Response error:', error.response || error);
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: async userData => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  login: async userData => {
    try {
      console.log('User data:', userData);
      const response = await axios.post(`${API_URL}/auth/login`, userData);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.log('Login error:', error.response?.data || error);
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  getCurrentUser: async token => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/auth/me`, config);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  updateProfile: async (userData, token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.put(
        `${API_URL}/auth/profile`,
        userData,
        config,
      );
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error);
      throw (
        error.response?.data || {
          success: false,
          message: 'Failed to update profile',
        }
      );
    }
  },
  getAddress: async token => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/auth/me`, config);
      return response.data.user.address;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
  updateAddress: async (address, token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        { address },
        config,
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
};

export const adminAPI = {
  login: async adminData => {
    try {
      const response = await axios.post(`${API_URL}/admin/login`, adminData);
      console.log('Admin login response:', response.data);
      return response.data;
    } catch (error) {
      console.log('Admin login error:', error.response?.data || error);
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
  create: async adminData => {
    try {
      const response = await axios.post(`${API_URL}/admin/create`, adminData);
      console.log('Create admin response:', response.data);
      return response.data;
    } catch (error) {
      console.log('Create admin error:', error.response?.data || error);
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
};

export const productAPI = {
  getProducts: async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      return response.data;
    } catch (error) {
      console.error('Get products error:', error.response?.data || error);
      throw (
        error.response?.data || {
          success: false,
          message: 'Failed to fetch products',
        }
      );
    }
  },
  getProduct: async id => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
  createProduct: async (productData, token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.post(
        `${API_URL}/products`,
        productData,
        config,
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data;
    } catch (error) {
      console.error('Create product error:', error.response?.data || error);
      throw error.response?.data || {success: false, message: 'Network error'};
    }
  },

  getAdminProducts: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/products/admin`, config);
      return response.data;
    } catch (error) {
      console.error('Get admin products error:', error.response?.data || error);
      throw error.response?.data || {success: false, message: 'Network error'};
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(
        `${API_URL}/products/${productId}`,
        productData,
        config,
      );
      return response.data;
    } catch (error) {
      console.error('Update product error:', error.response?.data || error);
      throw error.response?.data || {success: false, message: 'Network error'};
    }
  },

  deleteProduct: async productId => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(
        `${API_URL}/products/${productId}`,
        config,
      );
      return response.data;
    } catch (error) {
      console.error('Delete product error:', error.response?.data || error);
      throw error.response?.data || {success: false, message: 'Network error'};
    }
  },
};

export const chatAPI = {
  getChatParticipants: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token for chat participants:', token);

      const response = await axios.get(`${API_URL}/chat/participants`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Chat participants response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get chat participants error:', error.response || error);
      throw error.response?.data || {success: false, message: 'Network error'};
    }
  },

  getMessages: async participantId => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `${API_URL}/chat/messages/${participantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Get messages error:', error.response || error);
      throw error.response?.data || {success: false, message: 'Network error'};
    }
  },

  sendMessage: async (receiverId, message) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${API_URL}/chat/send`,
        {receiverId, message},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Send message error:', error.response || error);
      throw error.response?.data || {success: false, message: 'Network error'};
    }
  },
};

export const orderAPI = {
  placeOrder: async (orderData, token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.post(`${API_URL}/orders`, orderData, config);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
  getUserOrders: async token => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/orders/my`, config);
      return response.data.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
  createRazorpayOrder: async (orderData, token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.post(`${API_URL}/payment/razorpay-order`, orderData, config);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
};

export {API_URL, api};
