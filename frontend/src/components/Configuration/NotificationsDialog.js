import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

const NotificationsDialog = ({ open, onClose, notifications }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Notifications</DialogTitle>
            <DialogContent>
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
                                            <Typography variant="body2" color="textSecondary">
                                                {notification.message || 'No Message'}
                                            </Typography>
                                            {notification.start && (
                                                <Typography variant="caption" color="textSecondary">
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
