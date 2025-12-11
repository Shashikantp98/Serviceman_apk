import axios, { type AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../config";
// Create an axios instance with a mock base URL
export const api = axios.create({
  baseURL: API_BASE_URL, // This would be your real API in production
  timeout: 10000,
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authmobileToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token == "guest" ? "" : token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      if (error.response.status === 401) {
        // Unauthorized - token expired or invalid
        // localStorage.removeItem("authmobileToken");
        // window.location.href = "/";
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network error. Please check your connection.");
    } else {
      // Error setting up the request
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }
);

// Generic API request function
type ApiResponse<T> = Promise<T>;

class ApiService {
  // GET request
  static async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): ApiResponse<T> {
    const response = await api.get<T>(url, config);
    return response.data;
  }

  // POST request
  static async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): ApiResponse<T> {
    const response = await api.post<T>(url, data, config);
    return response.data;
  }

  // PUT request
  static async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): ApiResponse<T> {
    const response = await api.put<T>(url, data, config);
    return response.data;
  }

  // DELETE request
  static async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): ApiResponse<T> {
    const response = await api.delete<T>(url, config);
    return response.data;
  }
}

export default ApiService;
