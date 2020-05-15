const mongoose = require('mongoose');

const LabelSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  label: [{
    value: {
      type: String
    }
  }]
});

const Label = module.exports = mongoose.model('Label', LabelSchema);