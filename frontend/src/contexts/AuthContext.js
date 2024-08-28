import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      if (token) {
        try {
          console.log('Sending request to /api/auth/me');
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Full response from API:', response);
          console.log('User data from API:', response.data);
          if (response.data && Object.keys(response.data).length > 0) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            console.warn('API returned empty user data');
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
          }
          localStorage.removeItem('token');
        }
      } else {
        console.log('No token found in localStorage');
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
