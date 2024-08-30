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
import { useAuth } from '../../contexts/AuthContext';

const SchedulerPage = () => {
    const { user, loading } = useAuth();
    console.log('Current user:', user);

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
        const { event_id, id, title, start, end, priority, allDay, ...otherFields } = event;
        const isAllDay = allDay === '1' || allDay === true;
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
            color: event.checked ? '#6EACDA' : color, // Preserve blue color for checked events
            textColor: event.checked ? '#FFFFFF' : textColor,
            checked: event.checked || false,
            allDay: isAllDay
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
                console.log('Response from server after deletion:', response);
                // Check if response and response.data exist
                if (response.length > 0) {
                    const updatedTasks = response;
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
                    checked: event.checked || false
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

    // Modify this function to check for finished events
    const checkFinishedEvents = useCallback(() => {
        const now = new Date();
        const finishedEvent = events.find(event => 
            new Date(event.end) < now && !event.rescheduled && !event.checked
        );
        
        if (finishedEvent) {
            setCurrentFinishedEvent(finishedEvent);
            setOpenSnackbar(true);
        }
    }, [events]);

    // Modify the rescheduleEvent function
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
            rescheduled: true,
            checked: false // Reset the checked status when rescheduling
        };

        handleConfirm(updatedEvent, 'edit');
    }, [handleConfirm, events]);

    // Modify the useEffect hook to check for finished events periodically
    useEffect(() => {
        const interval = setInterval(checkFinishedEvents, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [checkFinishedEvents]);

    const handleEventResponse = useCallback((isCompleted) => {
        setOpenSnackbar(false);
        if (currentFinishedEvent) {
            const updatedEvent = { 
                ...currentFinishedEvent, 
                checked: isCompleted,
                color: isCompleted ? '#6EACDA' : currentFinishedEvent.color,
                textColor: isCompleted ? '#FFFFFF' : currentFinishedEvent.textColor
            };

            updateTask(currentFinishedEvent.id, updatedEvent)
                .then(response => {
                    console.log('Event updated:', response.data);
                    setEvents(prevEvents => prevEvents.map(event => 
                        event.id === updatedEvent.id ? updatedEvent : event
                    ));

                    if (!isCompleted) {
                        rescheduleEvent(updatedEvent);
                    }
                })
                .catch(error => {
                    console.error('Error updating event in database:', error);
                });
        }
    }, [currentFinishedEvent, updateTask, rescheduleEvent]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="scheduler">
            <div>
                <Box sx={{ mt: { xs: 1, sm: 2, md: 3, lg: 3 } }} />

                <Box sx={{ flexGrow: 1 }}>
                    <Toolbar>
                        <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                        Have a nice day, <span style={{ color: 'var(--primary-color)' }}>{user?.username || 'Guest'}</span>!
                        </Typography>
                    </Toolbar>
                </Box>

                <Box sx={{ mt: 3 }} />

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
                                month={{ 
                                    weekDays: [0, 1, 2, 3, 4, 5, 6], 
                                    weekStartOn: 6, 
                                    startHour: 1, 
                                    endHour: 26,
                                    navigation: true,
                                    disableGoToDay: false
                                }}
                                week={{ 
                                    weekDays: [0, 1, 2, 3, 4, 5, 6], 
                                    weekStartOn: 6, 
                                    startHour: 1, 
                                    endHour: 26,
                                    step: 120,
                                    navigation: true,
                                    disableGoToDay: false
                                }}
                                day={{
                                    startHour: 1, 
                                    endHour: 26,
                                    step: 120,
                                    navigation: true
                                }}
                                fields={[
                                    { name: "title", type: "input", config: { label: "What do you need to do?", required: true } },
                                    { name: "start", type: "date", config: { label: "When do you need to do it?", required: true } },
                                    { name: "end", type: "date", config: { label: "When will you finish it?", required: true } },
                                    { name: "allDay", type: "select", config: { label: "Is this an all-day event?", options: [{ value: '1', text: "Yes" }, { value: '0', text: "No" }] } },
                                    { name: "priority", type: "select", config: { label: "How important is this task?", options: priorityOptions, required: true } }
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
                    onClose={() => setOpenSnackbar(false)}
                    message={`Did you complete the task: ${currentFinishedEvent?.title}?`}
                    action={
                        <React.Fragment>
                            <Button color="primary" size="small" onClick={() => handleEventResponse(true)}>
                                Yes
                            </Button>
                            <Button color="secondary" size="small" onClick={() => handleEventResponse(false)}>
                                No
                            </Button>
                        </React.Fragment>
                    }
                />
            </div>
        </div>
    );
}

export default SchedulerPage;
