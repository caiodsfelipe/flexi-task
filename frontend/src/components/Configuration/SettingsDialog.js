import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '../../utils/pushNotifications';

const SettingsDialog = ({ open, onClose }) => {
    const [enableNotifications, setEnableNotifications] = useState(false);
    const [showPermissionRequest, setShowPermissionRequest] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        checkNotificationPermission();
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    const checkNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.permission;
            setEnableNotifications(permission === 'granted');
        }
    };

    const handleNotificationToggle = async (event) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    setEnableNotifications(true);
                    subscribeToPushNotifications();
                } else {
                    setShowPermissionRequest(true);
                }
            }
        } else {
            setEnableNotifications(false);
            unsubscribeFromPushNotifications();
        }
    };

    const handleDarkModeToggle = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);
        document.body.classList.toggle('dark-mode', newDarkMode);
    };

    const handleSave = () => {
        console.log('Saving settings:', { enableNotifications, darkMode });
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>Settings</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={enableNotifications}
                                    onChange={handleNotificationToggle}
                                />
                            }
                            label="Enable Notifications"
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={darkMode}
                                    onChange={handleDarkModeToggle}
                                />
                            }
                            label="Dark Mode"
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="secondary">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={showPermissionRequest}
                autoHideDuration={6000}
                onClose={() => setShowPermissionRequest(false)}
            >
                <Alert onClose={() => setShowPermissionRequest(false)} severity="info">
                    Please allow notifications in your browser settings to enable this feature.
                </Alert>
            </Snackbar>
        </>
    );
};

export default SettingsDialog;
