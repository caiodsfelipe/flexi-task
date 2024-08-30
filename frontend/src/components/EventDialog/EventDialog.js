import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format, parseISO, isValid } from 'date-fns';

// Custom styled date input to hide default calendar picker
const StyledDateTimeInput = styled(TextField)({
  '& input::-webkit-calendar-picker-indicator': {
    display: 'none',
  },
  '& input[type="datetime-local"]': {
    appearance: 'textfield',
  },
});

const EventDialog = ({ open, onClose, onSubmit, currentEvent, priorityOptions }) => {
    const [event, setEvent] = useState(null);

    // Update event state when dialog opens or currentEvent changes
    useEffect(() => {
        if (open && currentEvent) {
            setEvent({
                id: currentEvent.id,
                event_id: currentEvent.id?.toString(), // Add event_id for Scheduler
                title: currentEvent.title || "",
                start: currentEvent.start ? new Date(currentEvent.start) : new Date(),
                end: currentEvent.end ? new Date(currentEvent.end) : new Date(),
                priority: currentEvent.priority || "medium",
                disabled: false,
                color: currentEvent.color || "",
                textColor: currentEvent.textColor || "",
                editable: true,
                deletable: true,
                draggable: true,
                allDay: false,
                agendaAvatar: "",
            });
        } else if (open) {
            setEvent({
                id: null,
                event_id: null,
                title: "",
                start: new Date(),
                end: new Date(),
                priority: "medium",
                disabled: false,
                color: "",
                textColor: "",
                editable: true,
                deletable: true,
                draggable: true,
                allDay: false,
                agendaAvatar: "",
            });
        } else {
            setEvent(null);
        }
    }, [open, currentEvent]);

    // Handle form submission
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedEvent = Object.fromEntries(formData.entries());

        // Ensure start and end are valid Date objects
        try {
            const startDate = new Date(updatedEvent.start);
            const endDate = new Date(updatedEvent.end);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error("Invalid date");
            }
            
            updatedEvent.start = startDate.toISOString();
            updatedEvent.end = endDate.toISOString();
        } catch (error) {
            alert("Please enter valid start and end dates.");
            return;
        }

        updatedEvent.id = event ? event.id : null;
        updatedEvent.event_id = event ? event.id?.toString() : null; // Add event_id for Scheduler
        
        // Convert boolean fields
        ['disabled', 'editable', 'deletable', 'draggable', 'allDay'].forEach(field => {
            updatedEvent[field] = formData.get(field) === 'on';
        });

        // Add notification time
        updatedEvent.notificationTime = parseInt(localStorage.getItem('notificationTime') || '15');

        onSubmit(updatedEvent);
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        const parsedDate = new Date(date);
        return isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd'T'HH:mm") : '';
    };

    const handleDateChange = (field) => (e) => {
        const newDate = parseISO(e.target.value);
        if (isValid(newDate)) {
            setEvent(prev => ({ ...prev, [field]: newDate }));
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{event && event.id ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <form onSubmit={handleFormSubmit}>
                <DialogContent>
                    <TextField
                        name="title"
                        label="Title"
                        fullWidth
                        margin="normal"
                        value={event?.title || ''}
                        onChange={(e) => setEvent({ ...event, title: e.target.value })}
                        required
                        variant="filled"
                    />
                    <StyledDateTimeInput
                        name="start"
                        label="Start Date"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        value={formatDateForInput(event?.start)}
                        onChange={handleDateChange('start')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <CalendarTodayIcon />
                                </InputAdornment>
                            ),
                        }}
                        required
                        variant="filled"
                    />
                    <StyledDateTimeInput
                        name="end"
                        label="End Date"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        value={formatDateForInput(event?.end)}
                        onChange={handleDateChange('end')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <CalendarTodayIcon />
                                </InputAdornment>
                            ),
                        }}
                        required
                        variant="filled"
                    />
                    <FormControl fullWidth margin="normal" variant="filled">
                        <InputLabel id="priority-label">Priority</InputLabel>
                        <Select
                            labelId="priority-label"
                            name="priority"
                            value={event?.priority || 'medium'}
                            onChange={(e) => setEvent({ ...event, priority: e.target.value })}
                        >
                            {priorityOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>{option.text}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        name="color"
                        label="Color"
                        fullWidth
                        margin="normal"
                        value={event?.color || ''}
                        onChange={(e) => setEvent({ ...event, color: e.target.value })}
                        variant="filled"
                    />
                    <TextField
                        name="textColor"
                        label="Text Color"
                        fullWidth
                        margin="normal"
                        value={event?.textColor || ''}
                        onChange={(e) => setEvent({ ...event, textColor: e.target.value })}
                        variant="filled"
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        {event && event.id ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EventDialog;
