import React, { useState, useContext } from 'react';
import { TextField, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { Box } from '@mui/material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', { username, email, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/account');
    } catch (error) {
      console.error('Registration failed:', error);
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
        Register
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
          Register
        </Button>
        <Box sx={{ mt: 1 }} />
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
      </form>
    </Container>
    </Box>
  );
};

export default Register;
