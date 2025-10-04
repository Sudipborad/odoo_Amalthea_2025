import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'exists' : 'missing');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    
    // Show user-friendly error messages
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  signup: (data: any) => 
    api.post('/auth/signup', data),
};

export const userAPI = {
  createUser: (data: any) => 
    api.post('/users', data),
  updateUserRole: (id: string, role: string) => 
    api.put(`/users/${id}/role`, { role }),
  assignManager: (id: string, managerId: string) => 
    api.put(`/users/${id}/manager`, { managerId }),
  deleteUser: (id: string) => 
    api.delete(`/users/${id}`),
  getAllUsers: () => 
    api.get('/users'),
};

export const expenseAPI = {
  submitExpense: (data: FormData) => 
    api.post('/expenses', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyExpenses: () => 
    api.get('/expenses/me'),
  getTeamExpenses: () => 
    api.get('/expenses/team'),
  getAllExpenses: () => 
    api.get('/expenses'),
};

export const approvalAPI = {
  getPendingApprovals: () => 
    api.get('/approvals/pending'),
  processApproval: (expenseId: string, decision: string, comments?: string) => 
    api.post(`/approvals/${expenseId}`, { decision, comments }),
  createApprovalRule: (data: any) => 
    api.post('/approvals/rules', data),
  getApprovalRules: () => 
    api.get('/approvals/rules'),
  deleteApprovalRule: (ruleId: string) => 
    api.delete(`/approvals/rules/${ruleId}`),
  overrideApproval: (expenseId: string, status: string) => 
    api.put(`/approvals/${expenseId}/override`, { status }),
};

export const serviceAPI = {
  uploadOCR: (file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post('/ocr/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  convertCurrency: (from: string, to: string, amount: number) => 
    api.get(`/currency/convert?from=${from}&to=${to}&amount=${amount}`),
};

export const analyticsAPI = {
  getExpenseAnalytics: () => 
    api.get('/analytics/expenses'),
};

export default api;