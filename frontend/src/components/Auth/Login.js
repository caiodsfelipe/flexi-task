import React, { useState, useContext } from 'react';
import { TextField, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { Box } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/account');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '90vh',
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
