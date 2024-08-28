require('dotenv').config({ path: '.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes'); // Update the path as necessary
const notificationRoutes = require('./api/notifications');
const { scheduleAllNotifications } = require('./services/notificationService');
const SSE = require('express-sse');
const authRoutes = require('./routes/authRoutes');
const pushSubscriptionRoutes = require('./routes/pushSubscriptionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5001', // or your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Use task routes
app.use('/api', taskRoutes);

// Include notifications routes
app.use('/api/notifications', notificationRoutes);

// Include auth routes
app.use('/api/auth', authRoutes);

// Include push subscription routes
app.use('/api/push-subscription', pushSubscriptionRoutes);

console.log('MONGODB_URI:', process.env.MONGODB_URI); // Keep this for debugging if needed

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const sse = new SSE();

app.get('/notifications/stream', (req, res) => {
  console.log('New SSE connection established');
  sse.init(req, res);
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    scheduleAllNotifications(sse);
  })
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.get('/', (req, res) => {
  res.send('Flexible Scheduler API is running');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
