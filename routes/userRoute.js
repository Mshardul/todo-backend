var express = require('express');
var router = express.Router();

const User = require('../models/user.js');
const Task = require('../models/task.js');

/* REGISTER User */
router.post('/register', async function(req, res, next) {
  console.log("-----> adding user:", req.body);
  User.create(req.body, function(err, user) {
    if(err) {
      let errCode = err.code;
      console.log("error: ", err.code);
      let ret = {};
      if(errCode==11000){
        ret['code'] = 0;
        ret['msg'] = 'Email already exists';
        res.json(ret);
      }
      return next(err);
    }
    if(user){
      let userId = user._id;
      let t = new Task();
      t.userId = userId;
      Task.create(t, function(err, task) {
        if(err) {
          return next(err);
        }
        console.log(task);
      })
    }
    res.json(user);
  })
});

/* VERIFY User */
router.post('/login', async function(req, res, next) {
  console.log("-----> adding user:", req.body);
  User.find( { $and: [ { email: req.body.email }, { password: req.body.password} ] }, function(err, user) {
    if(err) {
      console.log("error: ", err.code);
      return next(err);
    }
    res.json(user);
  });
});
module.exports = router;