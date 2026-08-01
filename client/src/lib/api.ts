import axios from "axios";

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor to attach local JWT token
api.interceptors.request.use(
  async (config) => {
    // Wait for Clerk to be ready and get token
    if (window.Clerk && window.Clerk.session) {
      try {
        const token = await window.Clerk.session.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Clerk token fetch failed", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("API request failed with 401 Unauthorized.");
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
