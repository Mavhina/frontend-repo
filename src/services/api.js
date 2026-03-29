import axios from "axios";

// Automatically switch between localhost (dev) and Render backend (prod)
const BASE_URL =
  import.meta.env.DEV
    ? "http://localhost:8080/api"
    : "https://coursecompass-backend.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL
});

api.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAuthEndpoint =
    url.includes("/auth/login") || url.includes("/auth/register");

  if (!isAuthEndpoint) {
    const token = localStorage.getItem("jwt");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  const isFormData = config.data instanceof FormData;

  if (!isFormData) {
    config.headers["Content-Type"] = "application/json";
  } else {
    // Let Axios/browser set multipart boundary
    delete config.headers["Content-Type"];
  }

  return config;
});

export default api;
