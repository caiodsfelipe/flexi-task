import React, { useState, useContext } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', { username, email, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      setUser(response.data.user);
      navigate('/scheduler');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError('User already exists. Please try a different username or email.');
      } else {
        setError('Registration failed. Please try again.');
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
          Register
        </Typography>
        {error && (
          <Typography color="error" align="center" sx={{ mt: 2, mb: 1 }} gutterBottom>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="First Name"
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
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
          >
            Register
          </Button>
          <Box sx={{ mt: 1 }} />
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Already have an account? Log in
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export default Register;
