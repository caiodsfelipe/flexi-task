const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscriptionId: { type: String },
  subscriptionStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'canceled', 'past_due'],
    default: 'inactive'
  },
  registrationCode: { type: String },
  schedulePreferences: {
    lunchTime: Date,
    dinnerTime: Date,
    sleepTime: Date,
    wakeUpTime: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Method to check if user has an active subscription
userSchema.methods.hasActiveSubscription = function() {
  return this.subscriptionStatus === 'active';
};

module.exports = mongoose.model('User', userSchema);
