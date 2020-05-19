var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JWTStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var encryption = require('./encryption');

var secretKey = '12345-67890-09876-54321';

//autheticate method is automatically provided by passport
exports.local = passport.use(
    new LocalStrategy({

        usernameField : 'email',

        passwordField : 'password',

        passReqToCallback : true 
    },
    function(req, username, password, done) {

        User.findOne({email: username}, function(err, user) {
            console.log(user.password, encryption.encrypt(password))
            if (err) { return done(err); }
            if (!user) {
                 return done(null, false, { message: 'Incorrect username.' });
             }
            if (user.password != encryption.encrypt(password)) {
                 return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        })

    })
)
//takes care of the session 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//to set the expiry limit of the token
exports.getToken = function(user){
    return jwt.sign(user, secretKey, {
        expiresIn: 3600 
    })
}

var opts = {};
//get authorization from header's bearrer token
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretKey;


exports.jwtPassport = passport.use(new JWTStrategy(opts, (jwt_payload, done) => {
    console.log(jwt_payload);
    User.findOne({_id: jwt_payload._id}, (err, user) => {
        if(err){
            return done(err, false);
        }
        else if(user){
            return done(null, user);
        }
        else{
            return done(null, false);
        }
    })
}))

//uses the token that comes from authentication header and verifies the user
exports.verifyUser = passport.authenticate('jwt', {session: false});
