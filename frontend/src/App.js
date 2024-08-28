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
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
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

function AppContent({ toolbarContent }) {
  const { loading } = useAuth();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      console.log('Notification received in App:', notification);
      setNotifications(prev => {
        console.log('Updating notifications state:', [...prev, notification]);
        return [...prev, notification];
      });
      setUnreadCount(prev => prev + 1);
    });

    const closeSSE = initializeSSE();

    return () => {
      unsubscribe();
      closeSSE();
    };
  }, []);

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
        main: '#3f51b5',
        light: '#757de8',
        dark: '#002984',
      },
      secondary: {
        main: '#4caf50',
        light: '#80e27e',
        dark: '#087f23',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      text: {
        primary: '#212121',
        secondary: '#757575',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FlexiTask
          </Typography>
          {toolbarContent}
          <IconButton 
            color="inherit" 
            aria-label="notifications"
            onClick={handleNotificationClick}
          >
            <Badge badgeContent={unreadCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton 
            color="inherit" 
            aria-label="settings"
            onClick={() => setOpenSettings(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
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
    </ThemeProvider>
  );
}

function NavigationBar() {
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
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Account" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </Box>
  );
}

function App({ toolbarContent }) {
  return (
    <AuthProvider>
      <Router>
        <AppContent toolbarContent={toolbarContent} />
        <NavigationBar />
      </Router>
    </AuthProvider>
  );
}

export default App;
