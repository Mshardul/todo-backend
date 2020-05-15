const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = mongoose.Schema({
  //username and password are automatically added by passport-local-mongoose plugin
  email: {
    type: String,
    required: true,
    unique: true
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  saltSecret: {
    type: String
  }
});

//will add support for uaername and hashed support of password using hash and salt
UserSchema.plugin(passportLocalMongoose);

const User = module.exports = mongoose.model('User', UserSchema);