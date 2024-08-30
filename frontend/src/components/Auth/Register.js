import React, { useState, useContext, useEffect } from 'react';
import { TextField, Button, Typography, Container, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { Box } from '@mui/material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      console.log('Session ID from URL:', sessionId);
      if (sessionId) {
        try {
          console.log('Fetching session data...');
          const response = await axios.get(`/api/session/${sessionId}`);
          console.log('Session data received:', response.data);
          setEmail(response.data.email);
          setSessionId(sessionId);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching session data:', error);
          setError('Failed to retrieve session data. Please try again.');
          setLoading(false);
        }
      } else {
        console.log('No session ID found in URL');
        setSessionId(null);
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      const response = await axios.post('/api/auth/register', { username, email, password, sessionId });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/scheduler');
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
          <Typography color="error" align="center" gutterBottom>
            {error}
          </Typography>
        )}
        {sessionId ? (
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
              disabled
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
          </form>
        ) : (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Please complete the checkout process to register:
            </Typography>
            <Box sx={{ mt: 2 }}>
              <stripe-buy-button
                buy-button-id="buy_btn_1PsspwBAIWiwRgzWmZbQlZzf"
                publishable-key="pk_test_xALdQa86qg5mkwxVhIppiotu00c4JLTRY3"
              />
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Register;
