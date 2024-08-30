require('dotenv').config({ path: '.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const SSE = require('express-sse');
const authRoutes = require('./routes/authRoutes');
const stripeRoutes = require('./routes/stripeRoutes'); // Add this line

const app = express();
const PORT = process.env.PORT || 5000;

// Important: This line should come before any other middleware that parses the body
app.use('/webhook', express.raw({type: 'application/json'}));

app.use(cors({
  origin: 'http://localhost:5001', // or your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Use task routes
app.use('/api', taskRoutes);

// Include auth routes
app.use('/api/auth', authRoutes);

// Use Stripe routes
app.use('/api', stripeRoutes); // This will make the webhook available at /webhook

// Use Stripe routes
app.use('/', stripeRoutes); // This will make the webhook available at /webhook

if (!process.env.MONGODB_URI) {
  process.exit(1);
}

const sse = new SSE();

mongoose.connect(process.env.MONGODB_URI);

app.get('/', (req, res) => {
  res.send('Flexible Scheduler API is running');
});

app.listen(PORT);
