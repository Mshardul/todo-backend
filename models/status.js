const mongoose = require('mongoose');

const StatusSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  Status: [{
    value: {
      type: String
    }
  }]
});

const Status = module.exports = mongoose.model('Status', StatusSchema);