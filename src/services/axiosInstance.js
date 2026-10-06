import axios from 'axios';
import { API_CONFIG } from './apiConfig';

/**
 * Centralized Axios Instance with global request & response interceptors.
 */
const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Inject headers or log outgoing request details if required
    return config;
  },
  (error) => {
    return Promise.reject({
      message: error.message || 'Failed to initialize request',
      status: 400,
      originalError: error
    });
  }
);

// Response Interceptor for Centralized Error Handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected API error occurred',
      status: error.response?.status || 500,
      details: error.response?.data?.errors || error.response?.data || null,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase()
    };
    return Promise.reject(customError);
  }
);

export default axiosInstance;
