import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSystemStatus = () => apiClient.get('/status');
export const getNodeNames = () => apiClient.get('/node_names');
export const getData = (params) => apiClient.get('/data', { params });

export default apiClient;