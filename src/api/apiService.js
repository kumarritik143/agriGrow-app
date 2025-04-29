// Create a new file in your React Native project: api/apiService.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL for your API
const API_URL = 'http://127.0.0.1:5001/api'; // Use this for iOS simulator
// const API_URL = 'https://agrigrow-backend.onrender.com/api';

console.log('Platform:', Platform.OS);
console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increased timeout for deployed server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url);
    console.log('Request headers:', config.headers);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response from:', response.config.url, 'Status:', response.status);
    return response;
  },
  error => {
    console.error('Response error:', error.response || error);
    return Promise.reject(error);
  }
);

// API for authentication
export const authAPI = {
  // Register user
  register: async userData => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Login user
  login: async userData => {
    try {
      console.log('User data:', userData); // Debug log
      const response = await axios.post(`${API_URL}/auth/login`, userData);
      console.log('Login response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.log('Login error:', error.response?.data || error); // Debug log
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Get current user
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

  // Update user profile
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
};

// Add this to your existing apiService.js

export const adminAPI = {
  login: async adminData => {
    try {
      const response = await axios.post(`${API_URL}/admin/login`, adminData);
      console.log('Admin login response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.log('Admin login error:', error.response?.data || error); // Debug log
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
  }
};

export const productAPI = {
  // Get all products
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

  // Get single product
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

  // Fetch products added by the admin
  getAdminProducts: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/products/admin`, config);
      return response.data;
    } catch (error) {
      console.error("Get admin products error:", error.response?.data || error);
      throw error.response?.data || { success: false, message: "Network error" };
    }
  },

  // Update a product
  updateProduct: async (productId, productData) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(
        `${API_URL}/products/${productId}`,
        productData,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Update product error:", error.response?.data || error);
      throw error.response?.data || { success: false, message: "Network error" };
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(`${API_URL}/products/${productId}`, config);
      return response.data;
    } catch (error) {
      console.error("Delete product error:", error.response?.data || error);
      throw error.response?.data || { success: false, message: "Network error" };
    }
  },
};

// Add chat API methods
export const chatAPI = {
  // Get chat participants
  getChatParticipants: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token for chat participants:', token); // Debug log

      const response = await axios.get(`${API_URL}/chat/participants`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Chat participants response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Get chat participants error:', error.response || error);
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Get messages for a specific chat
  getMessages: async (participantId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_URL}/chat/messages/${participantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get messages error:', error.response || error);
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Send a message
  sendMessage: async (receiverId, message) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${API_URL}/chat/send`,
        { receiverId, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Send message error:', error.response || error);
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },
};

export { API_URL, api };