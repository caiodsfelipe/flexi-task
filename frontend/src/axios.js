// src/axios.js
import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Use the environment variable
});

export default instance;
