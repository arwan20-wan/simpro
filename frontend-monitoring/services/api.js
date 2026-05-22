import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9000/api",
  headers: {
    Accept: "application/json",
  },
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("simpro_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default API;
