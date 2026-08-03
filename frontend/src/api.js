import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const getSystemStatus = () => {
    return apiClient.get('/status');
};

export default apiClient;