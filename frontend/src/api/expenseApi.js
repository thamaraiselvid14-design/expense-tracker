import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/expenses';
if (!rawBaseUrl.endsWith('/')) {
  rawBaseUrl += '/';
}

const apiClient = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

export const getExpenses = (params = {}) => apiClient.get('', { params });

export const getExpense = (id) => apiClient.get(`${id}/`);

export const createExpense = (data) => apiClient.post('', data);

export const updateExpense = (id, data) => apiClient.put(`${id}/`, data);

export const deleteExpense = (id) => apiClient.delete(`${id}/`);

export default apiClient;
