import axios from 'axios';

let baseURL = 'http://192.168.18.50:3003';
let credentials = { username: '', password: '' };
let defaultDeviceId = '';

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const { username, password } = credentials;
  if (username && password) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    config.headers = config.headers || {};
    config.headers.Authorization = `Basic ${token}`;
  }
  if (defaultDeviceId) {
    config.headers = config.headers || {};
    config.headers['X-Device-Id'] = defaultDeviceId;
  }
  config.baseURL = baseURL || config.baseURL;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status || 0;
    const data = error.response?.data;
    const message = data?.error || data?.message || error.message || 'Request failed';
    return Promise.reject({ status, data, message });
  }
);

export const setBaseUrl = (url) => {
  baseURL = url;
};

export const setCredentials = (username, password) => {
  credentials = { username, password };
};

export const setDeviceId = (deviceId) => {
  defaultDeviceId = deviceId;
};

export const request = async (method, path, options = {}) => {
  const headers = { ...(options.headers || {}) };
  if (options.deviceId) headers['X-Device-Id'] = options.deviceId;
  const res = await client.request({ method, url: path, data: options.data, headers });
  return res.data;
};

export const get = (path, headers) => request('GET', path, { headers });
export const post = (path, data, headers) => request('POST', path, { data, headers });
export const del = (path, headers) => request('DELETE', path, { headers });

export default {
  setBaseUrl,
  setCredentials,
  setDeviceId,
  request,
  get,
  post,
  del,
};
