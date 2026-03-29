import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api"
  // ✅ DON'T set Content-Type here
});

api.interceptors.request.use((config) => {
  const url = config.url || "";

  // ✅ Don't attach JWT for login/register requests
  const isAuthEndpoint =
    url.includes("/auth/login") || url.includes("/auth/register");

  if (!isAuthEndpoint) {
    const token = localStorage.getItem("jwt");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  // ✅ Set JSON only if body is NOT FormData
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
