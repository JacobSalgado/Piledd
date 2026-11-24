import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // relative: dev server forward it to the backend VM
});

// runs before every request: attches token if user is logged in
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = 'Bearer ${token}';
    }
    return config;
});
export default api