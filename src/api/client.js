import axios from "axios";
import { API_BASE } from "../config";

export const TOKEN_KEY = "bithc_token";
export const USER_KEY = "bithc_user";

const client = axios.create({ baseURL: API_BASE, timeout: 15000 });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const isAuthCall = error.config?.url?.includes("/auth/");
    if (status === 401 && !isAuthCall) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);

export default client;
