
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);

export default api;
