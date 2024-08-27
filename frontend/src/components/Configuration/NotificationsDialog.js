import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const NotificationsDialog = ({ open, onClose, notifications }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Notifications</DialogTitle>
            <DialogContent>
                <List>
                    {notifications.filter(Boolean).length > 0 ? (
                        notifications.filter(Boolean).map((notification, index) => (
                            <ListItem key={index}>
                                <ListItemText 
                                    primary={notification.title || 'No Title'}
                                    secondary={notification.message || 'No Message'}
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
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default NotificationsDialog;
