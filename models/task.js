const mongoose = require('mongoose');

const TaskSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  task: [{
    value: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    label: [{
      type: String
    }],
    status: [{
      type: String
    }]
  }],
  label: [{
    type: String
  }],
  status: [{
    type: String
  }]
});

const Task = module.exports = mongoose.model('Task', TaskSchema);