const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Here you would typically save the subscription to your database
    console.log('Received push subscription:', req.body);
    res.status(201).json({ message: 'Subscription added successfully' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ message: 'Error saving subscription' });
  }
});

module.exports = router;
