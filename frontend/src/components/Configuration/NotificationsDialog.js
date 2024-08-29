import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '../../utils/pushNotifications';

const NotificationsDialog = ({ open, onClose, notifications }) => {
    const [enableNotifications, setEnableNotifications] = useState(false);

    useEffect(() => {
        checkNotificationPermission();
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
                }
            }
        } else {
            setEnableNotifications(false);
            unsubscribeFromPushNotifications();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Notifications</DialogTitle>
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
                <List>
                    {notifications.filter(Boolean).length > 0 ? (
                        notifications.filter(Boolean).map((notification, index) => (
                            <ListItem key={index} divider>
                                <ListItemText 
                                    primary={
                                        <Typography variant="subtitle1" color="primary">
                                            {notification.title || 'No Title'}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="textSecondary">
                                                {notification.message || 'No Message'}
                                            </Typography>
                                            {notification.start && (
                                                <Typography component="div" variant="caption" color="textSecondary">
                                                    Start: {new Date(notification.start).toLocaleString()}
                                                </Typography>
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No notifications" />
                        </ListItem>
                    )}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default NotificationsDialog;
