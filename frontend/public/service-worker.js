self.addEventListener('push', function(event) {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: 'path/to/icon.png',
        badge: 'path/to/badge.png'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    const eventData = event.notification.data;
    event.notification.close();

    if (eventData && eventData.eventId) {
        // Open the app and focus on the specific event
        clients.openWindow(`/scheduler?eventId=${eventData.eventId}`);
    } else {
        // Just open the app
        clients.openWindow('/scheduler');
    }
});
