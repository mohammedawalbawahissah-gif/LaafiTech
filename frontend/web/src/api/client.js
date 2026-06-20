import axios from "axios";

// Points at the Django backend (see ../backend/). Set VITE_API_BASE_URL
// in a .env file for local/staging/production targets.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("laafitech_token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("laafitech_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
