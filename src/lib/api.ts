import axios from "axios";

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
      if (typeof window !== "undefined" && window.location.pathname !== '/sign-in') {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
