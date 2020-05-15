const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  saltSecret: {
    type: String
  }
});

const User = module.exports = mongoose.model('User', UserSchema);