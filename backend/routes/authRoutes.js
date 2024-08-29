const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Store registration codes temporarily (in production, use a database)
const registrationCodes = new Map();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, registrationCode } = req.body;

    // Verify the registration code
    const registrationData = registrationCodes.get(registrationCode);
    if (!registrationData || registrationData.email !== email) {
      return res.status(400).send({ error: 'Invalid registration code' });
    }

    const user = new User({ username, email, password, subscriptionId: registrationData.subscriptionId });
    await user.save();

    // Remove the used registration code
    registrationCodes.delete(registrationCode);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).send({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the user has an active subscription
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
    if (subscription.status !== 'active') {
      return res.status(403).json({ message: 'Subscription inactive' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  // This route will be protected and will return the current user's data
  console.log('User from request:', req.user);
  res.send(req.user);
});

router.patch('/me', auth, async (req, res) => {
  console.log('Received update request with body:', req.body);
  console.log('User from request:', req.user);

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password', 'schedulePreferences'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  console.log('Updates:', updates);
  console.log('Is valid operation:', isValidOperation);

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(400).send(error);
  }
});

router.get('/user/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
