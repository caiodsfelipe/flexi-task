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
      if (token) {
        try {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data && Object.keys(response.data).length > 0) {
            setUser({
              ...response.data,
              paymentStatus: response.data.paymentStatus
            });
            setIsAuthenticated(true);
          } else {
            console.warn('API returned empty user data');
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
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
