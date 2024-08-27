import axios from 'axios';

// Create an axios instance with baseURL
const API = axios.create({ 
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

// Define API request functions
export const createTask = (id, task) => API.post('/tasks', task);

export const updateTask = (id, updatedTask) => API.put(`/tasks/${id}`, updatedTask);

export const deleteTask = (id) => API.delete(`/tasks/${id}`).then(res => res.data);

export const getTasks = () => API.get('/tasks');

export const getSchedule = () => API.get('/schedule');

export const getNotifications = () => API.get('/notifications');
