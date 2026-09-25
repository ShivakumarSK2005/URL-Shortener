import axios from "axios";
import { getToken, removeToken } from "./authService.js";

const sanitizeUrl = (url) => (url ? url.trim().replace(/\/+$/, "") : "");

export const AUTH_API_URL = sanitizeUrl(
  import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_BASE_URL || ""
);

export const URL_SERVICE_URL = sanitizeUrl(
  import.meta.env.VITE_URL_SERVICE_URL || import.meta.env.VITE_API_BASE_URL || ""
);

export const API_BASE_URL = URL_SERVICE_URL;

const authApi = axios.create({
  baseURL: AUTH_API_URL
});

const urlApi = axios.create({
  baseURL: URL_SERVICE_URL
});

const setupInterceptors = (client) => {
  client.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        removeToken();
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors(authApi);
setupInterceptors(urlApi);

export const registerUser = (userData) => {
  return authApi.post("/api/auth/register", userData);
};

export const loginUser = (credentials) => {
  return authApi.post("/api/auth/login", credentials);
};

export const getProfile = () => {
  return authApi.get("/api/auth/profile");
};

export const updateProfile = (profileData) => {
  return authApi.put("/api/auth/profile", profileData);
};

export const changePassword = (passwordData) => {
  return authApi.put("/api/auth/profile/password", passwordData);
};

export const shortenUrl = (originalUrl) => {
  return urlApi.post("/api/urls/shorten", { originalUrl });
};

export const getMyUrls = () => {
  return urlApi.get("/api/urls/my-urls");
};

export const getUrlStats = (shortCode) => {
  return urlApi.get(`/api/urls/stats/${shortCode}`);
};

export const deleteShortUrl = (shortCode) => {
  return urlApi.delete(`/api/urls/${shortCode}`);
};

export default urlApi;
