var express = require('express');
var router = express.Router();
var passport = require('passport');

const User = require('../models/user.js');
const Task = require('../models/task.js');

/* REGISTER User */
router.post('/register', async function(req, res, next) {
  console.log("-----> adding user:", req.body);
  User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, function(err, user) {
    if(err) {
      let errCode = err.code;
      console.log("error: ", err.code);
      let ret = {};
      if(errCode==11000){
        ret['code'] = 0;
        ret['msg'] = 'Email already exists';
        res.json({success: false, value: ret});
      }
      return next(err);
    }
    if(user){
      passport.authenticate('local')(req, res, () => {
        let userId = user._id;
        let t = new Task();
        t.userId = userId;
        Task.create(t, function(err, task) {
          if(err) {
            return next(err);
          }
          console.log(task);
        })
        res.json({success: true, message: 'Registered Successfully', value: user});
      })
      
    }
  })
});

/* VERIFY User */
router.post('/login', (req, res, next) => {
  console.log("-----> adding user:", req.body);
  //authenticate the user's username and hash
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});          
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Login Successful!', value: user});
    }); 
  }) (req, res, next);
});
module.exports = router;