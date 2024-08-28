import React, { useState, useCallback, useEffect } from 'react';
import { Scheduler } from "@aldabil/react-scheduler";
import './SchedulerPage.css';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { createTask, updateTask, getTasks, deleteTask } from '../../api';
import ErrorBoundary from '../ErrorBoundary';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';

const SchedulerPage = () => {
    const [events, setEvents] = useState([]);
    const [updateKey, setUpdateKey] = useState(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [currentFinishedEvent, setCurrentFinishedEvent] = useState(null);

    const memoizedCreateTask = useCallback(createTask, []);
    const memoizedUpdateTask = useCallback(updateTask, []);

    // Validate event dates to ensure they are valid Date objects
    const validateEventDates = (events) => {
        return events.filter(event => {
            return event.start instanceof Date && !isNaN(event.start.getTime()) &&
                   event.end instanceof Date && !isNaN(event.end.getTime());
        });
    };

    // Handle submitting an event (create or update)
    const handleConfirm = useCallback((event, action) => {
        console.log('Confirmed event:', event, 'Action:', action);
        const { event_id, id, title, start, end, priority, notificationTime, ...otherFields } = event;
        const apiCall = action === 'edit' ? memoizedUpdateTask : memoizedCreateTask;

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error("Invalid date detected:", { start, end });
            return Promise.reject("Invalid date detected. Please try again.");
        }

        // Set color and textColor based on priority
        let color, textColor;
        switch (priority) {
            case 'high':
                color = '#FF4136';
                textColor = '#FFFFFF';
                break;
            case 'medium':
                color = '#FFDC00';
                textColor = '#000000';
                break;
            case 'low':
                color = '#2ECC40';
                textColor = '#FFFFFF';
                break;
            default:
                color = '#3174ad';
                textColor = '#FFFFFF';
        }

        const eventToSubmit = {
            ...otherFields,
            id: id || event_id,
            title,
            start: startDate,
            end: endDate,
            priority,
            color,
            textColor,
            notificationTime: parseInt(notificationTime, 10)
        };

        console.log('Event to submit:', eventToSubmit);

        return apiCall(action === 'edit' ? eventToSubmit.id : null, eventToSubmit)
            .then(response => {
                console.log('Response from API after submit:', response);
                const processedEvent = {
                    ...response.data,
                    event_id: response.data.id.toString(),
                    start: new Date(response.data.start),
                    end: new Date(response.data.end),
                    draggable: true,
                    editable: true,
                    deletable: true,
                };
                console.log('Processed event:', processedEvent);
                setEvents(prevEvents => {
                    const updatedEvents = action === 'edit'
                        ? prevEvents.map(e => e.id === processedEvent.id ? processedEvent : e)
                        : [...prevEvents, processedEvent];
                    return validateEventDates(updatedEvents);
                });
                return processedEvent;
            })
            .catch(error => {
                console.error('Error processing event:', error);
                throw error;
            });
    }, [memoizedCreateTask, memoizedUpdateTask]);

    // Update the handleDelete function
    const handleDelete = useCallback((deletedId) => {
        console.log('Deleting event:', deletedId);
        deleteTask(deletedId)
            .then((response) => {
                // Check if response and response.data exist
                if (response && response.data) {
                    const updatedTasks = response.data;
                    console.log('Updated tasks from server:', updatedTasks);
                    
                    // Update the events state with the new list from the server
                    setEvents(updatedTasks.map(task => ({
                        ...task,
                        event_id: task.id.toString(), // Ensure event_id is set for Scheduler
                        start: new Date(task.start), // Convert start to Date object
                        end: new Date(task.end) // Convert end to Date object
                    })));
                } else {
                    // If no tasks are returned, set events to an empty array
                    console.log('No tasks returned from server after deletion');
                    setEvents([]);
                }
                
                // Force a re-render of the Scheduler
                setUpdateKey(prevKey => prevKey + 1);
            })
            .catch(error => {
                console.error('Error deleting event:', error);
                // Optionally, show an error message to the user
            });
    }, []);

    // Modify the useEffect hook where we fetch and set events
    useEffect(() => {
        getTasks()
            .then(response => {
                console.log('Raw events from database:', response.data);
                const processedEvents = response.data.map(event => ({
                    ...event,
                    event_id: event.id.toString(), // Add event_id for Scheduler
                    title: event.title,
                    start: new Date(event.start),
                    end: new Date(event.end),
                    draggable: true,
                    editable: true,
                    deletable: true,
                    color: event.color || '#3174ad',
                    textColor: event.textColor || '#ffffff',
                }));
                console.log('Processed events:', processedEvents);
                const validEvents = validateEventDates(processedEvents);
                setEvents(validEvents);
            })
            .catch(error => console.error('Error fetching events:', error));
    }, []);

    const priorityOptions = [
        { value: 'high', text: 'High' },
        { value: 'medium', text: 'Medium' },
        { value: 'low', text: 'Low' }
    ];

    // Add this new function to handle event drops
    const handleEventDrop = useCallback((droppedEvent, updatedEvent, originalEvent) => {
        console.log("Event drop attempted:", { droppedEvent, updatedEvent, originalEvent });

        return new Promise((resolve, reject) => {
            // Create an updated event object
            const eventToUpdate = {
                id: originalEvent.id, // Use id here
                title: originalEvent.title,
                start: new Date(updatedEvent),
                end: new Date(new Date(updatedEvent).getTime() + (originalEvent.end - originalEvent.start)),
                color: originalEvent.color,
                draggable: true,
                editable: true,
                deletable: true
            };
            console.log('Event to update:', eventToUpdate);
            memoizedUpdateTask(eventToUpdate.id, eventToUpdate)
                .then(response => {
                    const processedEvent = {
                        ...response.data,
                        event_id: response.data.id.toString(), // Set event_id for Scheduler
                        start: new Date(response.data.start),
                        end: new Date(response.data.end),
                        draggable: true,
                        editable: true,
                        deletable: true,
                    };

                    setEvents(prevEvents => {
                        const updatedEvents = prevEvents.map(e => 
                            e.id === processedEvent.id ? processedEvent : e
                        );
                        return updatedEvents;
                    });

                    // Force a re-render of the Scheduler
                    setUpdateKey(prevKey => prevKey + 1);

                    resolve(processedEvent);
                })
                .catch(error => {
                    console.error('Error updating dropped event:', error);
                    reject(error);
                });
        });
    }, [memoizedUpdateTask]);

    // Add these console logs to check if drag events are being triggered
    useEffect(() => {
        const scheduler = document.querySelector('.rs__scheduler');
        if (scheduler) {
            scheduler.addEventListener('dragstart', () => console.log('Drag started'));
            scheduler.addEventListener('dragend', () => console.log('Drag ended'));
        }
    }, []);

    useEffect(() => {
        console.log('Current events:', events);
    }, [events]);

    // Add this new function to check for finished events
    const checkFinishedEvents = useCallback(() => {
        const now = new Date();
        const finishedEvent = events.find(event => new Date(event.end) < now && !event.rescheduled);
        
        if (finishedEvent) {
            setCurrentFinishedEvent(finishedEvent);
            setOpenSnackbar(true);
        }
    }, [events]);

    // Add this function to reschedule the event
    const rescheduleEvent = useCallback((event) => {
        const now = new Date();
        let rescheduleDate;
        
        switch(event.priority) {
            case 'high':
                rescheduleDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
                break;
            case 'medium':
                rescheduleDate = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours later
                break;
            case 'low':
                rescheduleDate = new Date(now.setDate(now.getDate() + 1)); // Next day
                break;
            default:
                rescheduleDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
        }

        const duration = event.end - event.start;

        // Function to check if a time slot is available
        const isTimeSlotAvailable = (start, end) => {
            return !events.some(e => 
                (start < new Date(e.end) && new Date(e.start) < end) && e.id !== event.id
            );
        };

        // Find the next available time slot
        while (!isTimeSlotAvailable(rescheduleDate, new Date(rescheduleDate.getTime() + duration))) {
            rescheduleDate = new Date(rescheduleDate.getTime() + 30 * 60 * 1000); // Move 30 minutes forward
        }

        const updatedEvent = {
            ...event,
            start: rescheduleDate,
            end: new Date(rescheduleDate.getTime() + duration),
            rescheduled: true
        };

        handleConfirm(updatedEvent, 'edit');
    }, [handleConfirm, events]);

    // Modify the useEffect hook to check for finished events periodically
    useEffect(() => {
        const interval = setInterval(checkFinishedEvents, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [checkFinishedEvents]);

    // Add these handlers for the Snackbar
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const handleEventCompleted = () => {
        setOpenSnackbar(false);
        // You can add logic here to mark the event as completed if needed
    };

    const handleEventNotCompleted = () => {
        setOpenSnackbar(false);
        if (currentFinishedEvent) {
            rescheduleEvent(currentFinishedEvent);
        }
    };

    return (
        <div className="scheduler">
            <Box sx={{ flexGrow: 1 }}>
                <Toolbar>
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
                        Your Schedule
                    </Typography>
                </Toolbar>
            </Box>

            <Box sx={{ mt: 1 }} />

            <div className='scheduler-container'>
                <div className='schedule'>
                    <ErrorBoundary>
                        <Scheduler
                            key={updateKey}
                            view="month"
                            events={events}
                            onConfirm={handleConfirm}
                            onDelete={handleDelete}
                            onEventDrop={handleEventDrop}
                            alwaysShowAgendaDays={true}
                            resourceViewMode="tabs"
                            disableViewNavigator={false}
                            navigation={true}
                            draggable={true}
                            editable={true}
                            deletable={true}
                            resizable={true}
                            fields={[
                                { name: "title", type: "input", config: { label: "Title", required: true } },
                                { name: "start", type: "date", config: { label: "Start Date", required: true } },
                                { name: "end", type: "date", config: { label: "End Date", required: true } },
                                { name: "priority", type: "select", config: { label: "Priority", options: priorityOptions, required: true } },
                                { name: "notificationTime", type: "select", config: { 
                                    label: "Notification Time", 
                                    options: [
                                        { value: 5, text: "5 minutes before" },
                                        { value: 10, text: "10 minutes before" },
                                        { value: 15, text: "15 minutes before" },
                                        { value: 30, text: "30 minutes before" },
                                        { value: 60, text: "1 hour before" },
                                        { value: 120, text: "2 hours before" },
                                        { value: 1440, text: "1 day before" }
                                    ]
                                }}
                            ]}
                        />
                    </ErrorBoundary>
                </div>
            </div>

            <Box sx={{ mb: 10 }} />

            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={openSnackbar}
                autoHideDuration={null}
                onClose={handleSnackbarClose}
                message={`Did you complete the task: ${currentFinishedEvent?.title}?`}
                action={
                    <React.Fragment>
                        <Button color="primary" size="small" onClick={handleEventCompleted}>
                            Yes
                        </Button>
                        <Button color="secondary" size="small" onClick={handleEventNotCompleted}>
                            No
                        </Button>
                    </React.Fragment>
                }
            />
        </div>
    );
}

export default SchedulerPage;
