const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = new User({
      username,
      email,
      password,
      paymentStatus: 'unpaid'
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        paymentStatus: user.paymentStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/me', auth, async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password', 'schedulePreferences'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch (error) {
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
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.paymentStatus = 'paid';
    await user.save();
    res.json({ message: 'Payment confirmed', paymentStatus: 'paid' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
