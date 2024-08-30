import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, TextField, Button, CircularProgress, Snackbar, Divider } from '@mui/material';
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
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          navigate('/login');
        } else {
          setError('Failed to load user data. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, setIsAuthenticated]);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setIsEdited(true);
  };

  const handleSaveChanges = async () => {
    try {
      const updatedUser = {
        username: user.username,
        email: user.email,
        password: user.password // Include password in the update
      };

      const response = await axios.patch('/api/auth/me', updatedUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setUser({
        ...response.data,
        password: '' // Clear the password field after successful update
      });
      setIsEdited(false);
      setOpenSnackbar(true);

      // Update local storage with new user data (excluding password)
      const { password, ...userDataForStorage } = response.data;
      localStorage.setItem('user', JSON.stringify(userDataForStorage));
      
      setIsAuthenticated(true);
    } catch (error) {
      setError('Failed to update user data. Please try again.');
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
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
        <Typography variant="h4" gutterBottom>Your account</Typography>
        <TextField
          fullWidth
          label="First Name"
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
          label="New Password"
          name="password"
          type="password"
          value={user.password || ''}
          margin="normal"
          onChange={handleInputChange}
          helperText="Leave blank to keep current password"
        />
        <Box sx={{ m: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveChanges}
            disabled={!isEdited}
          >
            {isEdited ? 'Save Changes' : 'No Changes'}
          </Button>
        </Box>
        
        <Box sx={{ my: 4 }}>
          <Divider />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        <Box sx={{ mb: 10 }} />

        <Snackbar 
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={openSnackbar} 
          autoHideDuration={null} 
          onClose={handleCloseSnackbar}
        >
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
