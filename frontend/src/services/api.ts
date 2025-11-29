import axios from 'axios';

const API_BASE_URL: string = (globalThis as any).process?.env?.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Campaign API
export const campaignAPI = {
  getCampaigns: () => api.get('/campaigns'),
  getCampaign: (id: number) => api.get(`/campaigns/${id}`),
  createCampaign: (data: any) => api.post('/campaigns', data),
  updateCampaign: (id: number, data: any) => api.put(`/campaigns/${id}`, data),
  deleteCampaign: (id: number) => api.delete(`/campaigns/${id}`),
};

// Community API
export const communityAPI = {
  getCommunities: () => api.get('/communities'),
  getCommunity: (id: number) => api.get(`/communities/${id}`),
  createCommunity: (data: any) => api.post('/communities', data),
  updateCommunity: (id: number, data: any) => api.put(`/communities/${id}`, data),
  deleteCommunity: (id: number) => api.delete(`/communities/${id}`),
};

// Donor API
export const donorAPI = {
  getDonors: () => api.get('/donors'),
  getDonor: (id: number) => api.get(`/donors/${id}`),
  createDonor: (data: any) => api.post('/donors', data),
  updateDonor: (id: number, data: any) => api.put(`/donors/${id}`, data),
};

// Analytics API
export const analyticsAPI = {
  getDashboardMetrics: () => api.get('/analytics/metrics'),
  getCommunityCoverage: () => api.get('/analytics/coverage'),
  getFundingTrends: () => api.get('/analytics/funding-trends'),
};

// ML API
export const mlAPI = {
  getDonorMatches: (communityId: number) => api.get(`/ml/matches/${communityId}`),
  predictFunding: (campaignId: number) => api.get(`/ml/predict-funding/${campaignId}`),
  getRecommendations: () => api.get('/ml/recommendations'),
};

// Authentication API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  logout: () => {
    localStorage.removeItem('access_token');
    return Promise.resolve();
  },
  refreshToken: () => api.post('/auth/refresh'),
};

export default api;
