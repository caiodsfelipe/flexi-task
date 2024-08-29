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

function AppContent() {
  const { loading } = useAuth();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [notifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

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
                backgroundColor: 'var(--primary-dark)',
              },
            },
            '&.MuiButton-containedSecondary': {
              backgroundColor: 'var(--button-secondary-text-color)',
              color: 'var(--button-secondary-text-color)',
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
                backgroundColor: 'var(--button-primary-bg-hover)',
                color: 'var(--button-primary-text-color)',
              },
            },
            '&.MuiButton-outlinedSecondary': {
              color: 'var(--button-secondary-text-color)',
              borderColor: 'var(--button-secondary-text-color)',
              '&:hover': {
                backgroundColor: 'var(--button-secondary-bg-hover)',
                color: 'var(--button-secondary-text-color)',
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
            <StyledIconButton
              onClick={handleNotificationClick}
              aria-label="notifications"
              className="top-nav-item"
            >
              <Badge badgeContent={unreadCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </StyledIconButton>
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
