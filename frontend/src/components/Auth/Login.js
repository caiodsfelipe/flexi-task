import React, { useState, useContext, useEffect } from 'react';
import { TextField, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { Box } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/scheduler');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        navigate('/scheduler');
      } else {
        console.error('No token received from login');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
      }}
    >
      <Container maxWidth="xs">
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Box sx={{ mt: 2 }} />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
          <Box sx={{ mt: 1 }} />
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export default Login;
