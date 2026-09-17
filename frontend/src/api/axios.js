import axios from 'axios';

// Axios instance configured for Django REST Framework backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// API helper functions for expenses endpoint (/api/expenses/)
export const expenseAPI = {
  // Fetch list of expenses with optional query filters (category, search, ordering, start_date, end_date)
  getAllExpenses: (params = {}) => API.get('/api/expenses/', { params }),

  // Fetch expense statistics / analytics summary
  getSummary: () => API.get('/api/expenses/summary/'),

  // Fetch expense by ID
  getExpenseById: (id) => API.get(`/api/expenses/${id}/`),

  // Create new expense
  createExpense: (data) => API.post('/api/expenses/', data),

  // Update expense by ID
  updateExpense: (id, data) => API.put(`/api/expenses/${id}/`, data),

  // Delete expense by ID
  deleteExpense: (id) => API.delete(`/api/expenses/${id}/`),
};

export default API;
