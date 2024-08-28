const mongoose = require('mongoose');

// Create a schema for the counter
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Modify the taskSchema
const taskSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    title: String,
    start: Date,
    end: Date,
    priority: String,
    disabled: { type: Boolean, default: false },
    color: String,
    textColor: String,
    editable: { type: Boolean, default: true },
    deletable: { type: Boolean, default: true },
    draggable: { type: Boolean, default: true },
    allDay: { type: Boolean, default: false },
    agendaAvatar: String,
    notificationTime: Number,
    checked: { type: Boolean, default: false }
});

// Pre-save hook to auto-increment the id
taskSchema.pre('save', function(next) {
    const doc = this;
    Counter.findByIdAndUpdate(
        { _id: 'taskId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    )
    .then(function(counter) {
        doc.id = counter.seq;
        next();
    })
    .catch(function(error) {
        return next(error);
    });
});

module.exports = mongoose.model('Task', taskSchema);
