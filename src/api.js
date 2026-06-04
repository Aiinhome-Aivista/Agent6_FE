import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  // baseURL: 'http://122.163.121.176:3008',

});

// Automatically inject JWT token into all requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
