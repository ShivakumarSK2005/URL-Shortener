import axios from "axios";
import { getToken, removeToken } from "./authService.js";

export const API_BASE_URL = "";

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
    }

    return Promise.reject(error);
  }
);

export const registerUser = (userData) => {
  return api.post("/api/auth/register", userData);
};

export const loginUser = (credentials) => {
  return api.post("/api/auth/login", credentials);
};

export const getProfile = () => {
  return api.get("/api/auth/profile");
};

export const updateProfile = (profileData) => {
  return api.put("/api/auth/profile", profileData);
};

export const changePassword = (passwordData) => {
  return api.put("/api/auth/profile/password", passwordData);
};

export const shortenUrl = (originalUrl) => {
  return api.post("/api/urls/shorten", { originalUrl });
};

export const getMyUrls = () => {
  return api.get("/api/urls/my-urls");
};

export const getUrlStats = (shortCode) => {
  return api.get(`/api/urls/stats/${shortCode}`);
};

export const deleteShortUrl = (shortCode) => {
  return api.delete(`/api/urls/${shortCode}`);
};

export default api;
