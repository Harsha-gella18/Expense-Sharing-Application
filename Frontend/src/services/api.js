import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
}

// Groups API
export const groupsAPI = {
  create: (data) => api.post('/groups', data),
  getAll: () => api.get('/groups'),
  join: (joinCode) => api.post('/groups/join', { joinCode }),
  respondToJoinRequest: (groupId, requestId, action) =>
    api.post(`/groups/${groupId}/join-requests/${requestId}/respond`, { action }),
}

// Expenses API
export const expensesAPI = {
  create: (groupId, data) => api.post(`/groups/${groupId}/expenses`, data),
  getGroupExpenses: (groupId) => api.get(`/groups/${groupId}/expenses`),
  respond: (expenseId, action) =>
    api.post(`/expenses/${expenseId}/respond`, { action }),
}

// Balances API
export const balancesAPI = {
  getGroupBalances: (groupId) => api.get(`/groups/${groupId}/balances`),
  settle: (groupId, data) => api.post(`/groups/${groupId}/settle`, data),
}

export default api
