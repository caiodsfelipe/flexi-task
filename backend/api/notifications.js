const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Array to store SSE clients
let clients = [];

// SSE endpoint for real-time notifications
// Move this route to the top to ensure it's not confused with the /:id route
router.get('/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // Send a test event to the client immediately
    res.write(`data: ${JSON.stringify({title: 'Connected to notification stream', message: 'Connected to notification stream', type: 'TASK_NOTIFICATION'})}\n\n`);

    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    clients.push(newClient);

    req.on('close', () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
    });
});

// Function to send events to all connected clients
function sendEventToAll(notification) {
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(notification)}\n\n`))
}

// Create a new notification
router.post('/', async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        sendEventToAll(notification);
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a specific notification
router.get('/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a notification (e.g., mark as read)
router.patch('/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
