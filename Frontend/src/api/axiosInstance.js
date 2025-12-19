import axios from "axios";
import { getAuth, clearAuth } from "../utils/authStorage";

const api = axios.create({
  // set your baseURL here (keep existing behaviour)
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4001",
  withCredentials: true,
  timeout: 10_000,
});

// request interceptor to attach token from centralized auth storage
api.interceptors.request.use(
  (config) => {
    try {
      const { token } = getAuth();
      if (token) {
        config.headers = config.headers || {};
        // Bearer token style (backend expected)
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// simple response interceptor: if 401, clear local auth (so UI can react)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // optional: clear stored auth so user is forced to re-login
      try {
        clearAuth();
        // note: do not try to mutate React state here; components should detect missing auth
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(err);
  }
);

export default api;
