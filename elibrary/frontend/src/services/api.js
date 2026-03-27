import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const bookService = {
  getAll: async (params = {}) => {
    const response = await api.get('/books', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
  create: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },
  update: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  }
};

export const rentalService = {
  create: async (bookId, rentalDays) => {
    const response = await api.post('/rentals', { bookId, rentalDays });
    return response.data;
  },
  getMyRentals: async () => {
    const response = await api.get('/rentals/my-rentals');
    return response.data;
  },
  returnBook: async (id) => {
    const response = await api.put(`/rentals/${id}/return`);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/rentals');
    return response.data;
  }
};

export default api;
