import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || '/api';
// Fix for missing /api path in production environments like Render
if (baseURL.startsWith('http') && !baseURL.endsWith('/api')) {
    baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
});

// Attach token from localStorage on startup
const token = localStorage.getItem('token');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;
