import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, TextField, Button, CircularProgress, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AccountManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '' // Initialize password as an empty string
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [isEdited, setIsEdited] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/auth/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser({
          ...response.data,
          password: '' // Ensure password is always an empty string
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.response && err.response.status === 401) {
          console.log('Unauthorized access. Redirecting to login page.');
          localStorage.removeItem('token'); // Clear the invalid token
          setIsAuthenticated(false); // Update auth context
          navigate('/login'); // Redirect to login page
        } else {
          setError('Failed to load user data. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, setIsAuthenticated]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [navigate, setIsAuthenticated]);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setIsEdited(true);
  };

  const handleSaveChanges = async () => {
    try {
      const updatedUser = {
        username: user.username,
        email: user.email
      };
      console.log('Sending update request with data:', updatedUser);
      const response = await axios.patch('/api/auth/me', updatedUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Server response:', response);
      setUser(response.data);
      setIsEdited(false);
      setOpenSnackbar(true); // Show success toast

      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Refresh the auth context
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error updating user data:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      setError('Failed to update user data. Please try again.');
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };


  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}><Typography color="error">{error}</Typography></Box>;
  if (!isAuthenticated) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}><Typography>Please log in to view your account.</Typography></Box>;
  if (!user) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}><Typography>No user data available.</Typography></Box>;

  return (
    <div className='account-management'>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Container maxWidth="sm">
        <Box sx={{ m: 4 }} />
        <Typography variant="h4" gutterBottom>My Account</Typography>
        <Typography variant="h6" gutterBottom>Upgrade Your Account</Typography>
        <stripe-buy-button
          buy-button-id="buy_btn_1PsspwBAIWiwRgzWmZbQlZzf"
          publishable-key="pk_test_xALdQa86qg5mkwxVhIppiotu00c4JLTRY3"
        />
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={user.username}
          margin="normal"
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={user.email}
          margin="normal"
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={user.password || ''} // Ensure value is always a string
          margin="normal"
          onChange={handleInputChange}
        />
        <Box sx={{ m: 2 }} />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSaveChanges}
          disabled={!isEdited}
        >
          {isEdited ? 'Save Changes' : 'No Changes'}
        </Button>
        
        <Box sx={{ mb: 10 }} />

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Account updated successfully!
          </Alert>
        </Snackbar>
      </Container>
      </Box>
    </div>
  );
};

export default AccountManagement;
