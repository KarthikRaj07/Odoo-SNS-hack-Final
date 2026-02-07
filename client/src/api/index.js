
import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export const getCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);

export default api;
