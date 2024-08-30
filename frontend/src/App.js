import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import SchedulerPage from './components/SchedulerPage/SchedulerPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AccountManagement from './components/Account/AccountManagement';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import Box from '@mui/material/Box';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import { useEffect } from 'react';
import PaymentGateway from './components/Auth/PaymentGateway';
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'var(--nav-background-color)',
  color: 'var(--nav-text-color)',
  boxShadow: 'none',
  borderBottom: '1px solid var(--nav-border-color)', // Updated this line
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  justifyContent: 'space-between',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'var(--nav-text-color)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)', // Light hover effect
  },
}));

const ProtectedRoute = ({ children, path }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.paymentStatus !== 'paid' && path === '/scheduler') {
    return <PaymentGateway />;
  }

  return children;
};

function AppContent() {
  const { loading, isAuthenticated } = useAuth();
  const [setOpenSettings] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  // Add this effect to force a re-render when the auth state changes
  useEffect(() => {
    // This empty dependency array ensures the effect runs only once when the component mounts
  }, [isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  const theme = createTheme({
    palette: {
      primary: {
        main: '#6EACDA',
        light: '#757de8',
        dark: '#6EACDA',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#6EACDA',
        light: '#757de8',
        dark: '#6EACDA',
        contrastText: '#ffffff',
      },
      background: {
        default: '#fff',
        paper: '#ffffff',
      },
      text: {
        primary: '#212121',
        secondary: '#757575',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--nav-background-color)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          contained: {
            '&.MuiButton-containedPrimary': {
              backgroundColor: 'var(--primary-color)',
              color: 'var(--button-primary-text-color)',
              '&:hover': {
                backgroundColor: 'var(--primary-color)',
              },
            },
            '&.MuiButton-containedSecondary': {
              backgroundColor: 'var(--button-secondary-bg)',
              color: 'var(--button-secondary-text-color)',
              '&:hover': {
                backgroundColor: 'var(--button-secondary-bg)',
              },
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isHomePage && (
        <StyledAppBar position="sticky" className="top-nav">
          <StyledToolbar>
            {location.pathname !== '/' && (
              <StyledIconButton
                edge="start"
                onClick={() => navigate(-1)}
                aria-label="back"
                className="top-nav-item"
              >
                <ArrowBackIcon />
              </StyledIconButton>
            )}
            <AccessTimeIcon 
              sx={{ 
                fontSize: '30px', 
                color: 'inherit'
              }} 
              className="top-nav-item"
            />
          </StyledToolbar>
        </StyledAppBar>
      )}
      <Box sx={{ paddingTop: isHomePage ? 0 : '16px', paddingBottom: '56px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/scheduler"
            element={
              <ProtectedRoute path="/scheduler">
                <SchedulerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute path="/account">
                <AccountManagement />
              </ProtectedRoute>
            }
          />
          {/* Add a catch-all route for any undefined routes */}
          <Route
            path="*"
            element={
              <Navigate to="/" replace />
            }
          />
        </Routes>
        {!isHomePage && isAuthenticated && (
          <NavigationBar 
            setOpenSettings={setOpenSettings}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

function NavigationBar({ setOpenSettings }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(() => {
    if (location.pathname === '/') return 0;
    if (location.pathname === '/account') return 1;
    return 0;
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 0) {
      navigate('/scheduler');
    } else if (newValue === 1) {
      navigate('/account');
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      zIndex: 1000,
      boxShadow: 'none',
    }}>
      <BottomNavigation 
        value={value} 
        onChange={handleChange} 
        showLabels
        className="bottom-nav"
        sx={{
          boxShadow: 'none',
          backgroundColor: 'var(--nav-background-color)',
          borderTop: '1px solid var(--nav-border-color)',
        }}
      >
        <BottomNavigationAction 
          icon={<HomeIcon />} 
          className="bottom-nav-item"
        />
        <BottomNavigationAction 
          icon={<AccountCircleIcon />} 
          className="bottom-nav-item"
        />
      </BottomNavigation>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
