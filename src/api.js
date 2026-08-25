import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://187.127.163.17:3029',
  baseURL: 'http://187.127.163.17:3029',

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
