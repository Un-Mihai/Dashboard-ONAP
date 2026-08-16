import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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