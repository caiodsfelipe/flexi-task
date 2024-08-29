import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import SchedulerPage from './components/SchedulerPage/SchedulerPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AccountManagement from './components/Account/AccountManagement';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsDialog from './components/Configuration/NotificationsDialog';
import SettingsDialog from './components/Configuration/SettingsDialog';
import { initializeSSE, subscribeToNotifications } from './services/notificationService';
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
import { subscribeToPushNotifications } from './utils/pushNotifications';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'var(--nav-background-color)',
  color: 'var(--nav-text-color)',
  boxShadow: 'none', // Light shadow for the AppBar
  borderBottom: '1px solid #f3f3f3',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  justifyContent: 'space-between',
}));

function AppContent() {
  const { loading } = useAuth();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      console.log('Notification received in App:', notification);
      setNotifications(prev => {
        console.log('Updating notifications state:', [...prev, notification]);
        return [...prev, notification];
      });
      setUnreadCount(prev => prev + 1);
    });

    // Subscribe to push notifications
    subscribeToPushNotifications().catch(error => {
      console.error('Failed to subscribe to push notifications:', error);
    });

    const closeSSE = initializeSSE();

    return () => {
      unsubscribe();
      closeSSE();
    };
  }, []);

  const isHomePage = location.pathname === '/';

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleNotificationClick = () => {
    setOpenNotifications(true);
    setUnreadCount(0);
  };
  
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#6EACDA',
        light: '#757de8',
        dark: '#002984',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#6EACDA',
        light: '#757de8',
        dark: '#002984',
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
            backgroundColor: '#fff',
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
              color: 'var(--button-text-color)',
              '&:hover': {
                backgroundColor: 'var(--primary-dark)',
              },
            },
            '&.MuiButton-containedSecondary': {
              backgroundColor: 'var(--button-secondary-text-color)',
              color: 'var(--button-text-color)',
              '&:hover': {
                backgroundColor: 'var(--secondary-dark)',
              },
            },
          },
          outlined: {
            '&.MuiButton-outlinedPrimary': {
              color: 'var(--primary-color)',
              borderColor: 'var(--primary-color)',
              '&:hover': {
                backgroundColor: 'var(--primary-light)',
                color: 'var(--button-text-color)',
              },
            },
            '&.MuiButton-outlinedSecondary': {
              color: 'var(--button-secondary-text-color)',
              borderColor: 'var(--button-secondary-text-color)',
              '&:hover': {
                backgroundColor: 'var(--secondary-light)',
                color: 'var(--button-text-color)',
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
        <StyledAppBar position="sticky">
          <StyledToolbar>
            {location.pathname !== '/' && (
              <IconButton
                edge="start"
                sx={{ color: 'var(--nav-text-color)' }}
                onClick={() => navigate(-1)}
                aria-label="back"
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <AccessTimeIcon 
              sx={{ 
                fontSize: '30px', 
                color: 'var(--nav-text-color)'
              }} 
            />
            <div style={{ width: 48 }} /> {/* Spacer to balance the layout */}
          </StyledToolbar>
        </StyledAppBar>
      )}
      <Box sx={{ paddingTop: isHomePage ? 0 : '16px' }}> {/* Adjust padding based on whether it's the homepage */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scheduler" element={<SchedulerPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<AccountManagement />} />
        </Routes>
        <NotificationsDialog
          open={openNotifications}
          onClose={() => setOpenNotifications(false)}
          notifications={notifications}
        />
        <SettingsDialog
          open={openSettings}
          onClose={() => setOpenSettings(false)}
        />
        {!isHomePage && (
          <NavigationBar 
            unreadCount={unreadCount}
            handleNotificationClick={handleNotificationClick}
            setOpenSettings={setOpenSettings}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

function NavigationBar({ unreadCount, handleNotificationClick, setOpenSettings }) {
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
      boxShadow: 'none', // Remove the shadow
      borderTop: '1px solid #f3f3f3', // Add a light border on top
    }}>
      <BottomNavigation 
        value={value} 
        onChange={handleChange} 
        showLabels
        className="bottom-nav"
        sx={{
          boxShadow: 'none', // Ensure no shadow on the BottomNavigation component
          backgroundColor: 'var(--nav-background-color)', // Match the AppBar background color
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
        <BottomNavigationAction 
          icon={
            <Badge badgeContent={unreadCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          }
          onClick={handleNotificationClick}
          className="bottom-nav-item"
        />
        <BottomNavigationAction 
          icon={<SettingsIcon />}
          onClick={() => setOpenSettings(true)}
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
