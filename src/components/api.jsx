import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Ajouter token automatiquement si موجود
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // لا تستعمل interceptor إذا request جا فيه Authorization خاص
  if (!config.headers.Authorization && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * General API caller
 * @param {string} url        - endpoint
 * @param {string} method     - GET, POST, PUT, DELETE
 * @param {object} data       - body or params
 * @param {object} headers    - extra headers (optional)
 */
export const callApi = async (url, method = "GET", data = null, headers = {}) => {
  try {
    const response = await API({
      url,
      method,
      data,
      headers, // ← نمرر الـ headers هنا
    });

    return response.data;
  } catch (error) {
    console.error("API ERROR:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export default API;
