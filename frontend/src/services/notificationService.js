let listeners = [];

export const subscribeToNotifications = (listener) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
};

export const pushNotification = (notification) => {
    console.log('Pushing notification to listeners:', notification);
    listeners.forEach(listener => listener(notification));
};

// This function would be called by your backend, e.g., through a WebSocket connection
export const receiveNotification = (notification) => {
    pushNotification(notification);
};

// Add this new function
export const initializeSSE = () => {
    console.log('Initializing SSE connection');
    const eventSource = new EventSource(`${process.env.REACT_APP_API_URL}/notifications/stream`, { withCredentials: true });

    eventSource.onopen = () => {
        console.log('SSE connection opened');
    };

    eventSource.onmessage = (event) => {
        console.log('Raw SSE message received:', event);
        try {
            const data = JSON.parse(event.data);
            console.log('Parsed SSE data:', data);
            if (data.type === 'TASK_NOTIFICATION') {
                console.log('Task notification received:', data.task);
                pushNotification(data.task);
            } else {
                console.log('Unknown notification type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing SSE message:', error);
        }
    };

    eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        console.log('SSE readyState:', eventSource.readyState);
        if (eventSource.readyState === EventSource.CLOSED) {
            console.log('SSE connection closed');
        }
    };

    return () => {
        console.log('Closing SSE connection');
        eventSource.close();
    };
};
