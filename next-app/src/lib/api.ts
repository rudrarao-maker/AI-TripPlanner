import axios from "axios";
import { supabase } from "./supabase/client";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Next.js Server Components and API Routes automatically read the Clerk session cookie.
// No manual token injection is required for same-origin requests.

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("API request failed with 401 Unauthorized.");
      if (typeof window !== "undefined" && window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
