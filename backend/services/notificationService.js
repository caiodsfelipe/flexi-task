const Task = require('../models/Task');
const schedule = require('node-schedule');

let sseInstance;

const scheduleNotification = async (task) => {
    const now = new Date();
    const taskStart = new Date(task.start);
    const notificationTime = new Date(taskStart.getTime() - task.notificationTime * 60000);
    
    console.log(`Scheduling notification for task: ${task.title}`);
    
    if (notificationTime <= now) {
        console.log(`Notification time is in the past. Sending notification immediately for task: ${task.title}`);
        sendNotification(task);
    } else {
        console.log(`Notification scheduled for: ${notificationTime}`);
        schedule.scheduleJob(notificationTime, function() {
            sendNotification(task);
        });
    }
};

const sendNotification = (task) => {
    console.log(`Attempting to send notification for task: ${task.title}`);
    
    if (sseInstance) {
        console.log('SSE instance found, sending notification');
        const notificationData = {
            type: 'TASK_NOTIFICATION',
            task: {
                id: task.id,
                title: task.title,
                start: task.start
            }
        };
        console.log('Notification data:', notificationData);
        sseInstance.send(notificationData);
        console.log('Notification sent via SSE');
    } else {
        console.error('SSE instance not found');
    }
};

const scheduleAllNotifications = async (sse) => {
    sseInstance = sse;
    const tasks = await Task.find({});
    tasks.forEach(scheduleNotification);
};

module.exports = { scheduleNotification, scheduleAllNotifications };
