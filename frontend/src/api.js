import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 1. INTERCEPTOR PENTRU TOKEN JWS
// ==========================================
apiClient.interceptors.request.use(
  (config) => {
    // Luăm token-ul salvat în starea globală (în localStorage)
    const token = localStorage.getItem('jws_token');
    
    // Dacă există, îl atașăm în header-ul de Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// 2. APELUL DE LOGIN
// ==========================================
export const loginUser = (username, password) => {
  // Trimitem credentials către backend. 
  // NOTĂ: Am presupus că ruta din FastAPI se numește '/login'. 
  // Dacă colegii tăi au numit-o altfel (ex: '/auth/token'), modifică aici.
  return apiClient.post('/login', { 
    username: username, 
    password: password 
  });
};

// ==========================================
// APELURILE TALE EXISTENTE (Neschimbate)
// ==========================================
export const getTelemetryData = (
  nodeName,
  metricsList,
  bucketSize,
  aggregate,
  startTime,
  endTime
) => {
  const metricsParam = JSON.stringify({ metrics: metricsList });

  return apiClient.post('/data', null, {
    params: {
      node_name: nodeName,
      metrics: metricsParam,
      bucket_size: bucketSize,
      aggregate: aggregate,
      start_time: startTime,
      end_time: endTime
    }
  });
};

export const getNodeNames = () => {
  return apiClient.post('/node_names');
};

export default apiClient;