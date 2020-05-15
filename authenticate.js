var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

//autheticate method is automatically provided by passport
exports.local = passport.use(new LocalStrategy(User.authenticate()));
//takes care of the session 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());