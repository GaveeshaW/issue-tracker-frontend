import axios from "axios";

const api = axios.create({
  baseURL: "https://issue-tracker-backend-8mqf.onrender.com",
});

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;