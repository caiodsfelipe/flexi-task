const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Ensure this path is correct
const { scheduleNotification } = require('../services/notificationService');

// Create a new task
router.post('/tasks', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        await scheduleNotification(task);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a task
router.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        await scheduleNotification(task);
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ id: req.params.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        // Fetch the updated list of tasks
        const updatedTasks = await Task.find();
        
        res.status(200).json(updatedTasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
