var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate');
var encryption = require('../encryption');

const User = require('../models/user.js');
const Task = require('../models/task.js');

/* REGISTER User */
router.post('/register', async function(req, res, next) {
  console.log("-----> adding user:", req.body);
  const new_user = new User({
    username: req.body.username,
    email: req.body.email,
    security_question: req.body.security_question,
    security_answer: req.body.security_answer,
    password: encryption.encrypt(req.body.password)
  })
  User.register(new_user, req.body.password, function(err, user) {
    if(err) {
      console.log("error: ", err);
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'User already exists'});
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
        console.log(user)
        res.json({success: true, status: 'User Registered Successfully'});
      })
      
    }
  })
});

/* VERIFY User */
router.post('/login', (req, res, next) => {
  console.log("-----> logging user:", req.body);
  //authenticate the user's username and hash
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.send({success: false, status: 'Email or Password incorrect', err: info});
      res.end();
    }
    else{
      req.logIn(user, (err) => {
        console.log(user)
        if (err) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.send({success: false, status: 'Email or Password incorrect', err: 'Could not log in user!'});          
        }

        //create the token of the user from user id
        var token = authenticate.getToken({_id: req.user._id});
        Task.find({userId: req.user._id}, (err, result) => {
          if(err){
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.send({success: false, status: 'Tasks not found'})
          }
          else{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send({success: true, status: 'Login Successful!', value: user, token: token, tasks: result});
          }
        })
        
      }); 
  }
  }) (req, res, next);
});

/**
 * verify the email, security question and answer 
 * of the user who has forgotten password
 */
router.post('/verifyuser', function(req, res, next){
  User.findOne({$and: [{email: req.body.email}, {security_question: req.body.security_question}, {security_answer: req.body.security_answer}]}, (err, result) => {
    if(err || !result){
      console.log(err);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.send({success: false, status: 'Email Id or Security Details incorrect'})
    }
    else if(result){
      console.log(result);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.send({success: true, status: 'Verification Successful'})
      
    }
  })
})

/**
 * Change password 
 */
router.post('/changepassword', function(req, res, next){
  User.findOne({email: req.body.email}, (err, result) => {
    if(err || !result){
      console.log(err);
      req.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.send({success: false, status: 'Email Id not found'})
    }
    else if(result){
      result.password = encryption.encrypt(req.body.password);
      User.updateOne( 
        { email: result.email},
        { $set: {
          password: encryption.encrypt(req.body.password)
        } },
        { safe: true, upsert: true }, 
        function(err, result) {
          if(err) {
            console.log(err);
            req.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.send({success: false, status: 'Email Id not found'})
          } else {
            req.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send({success: true, status: 'Password change successfully!'})
          }
        }
      );
      
      
    }
  })
})



/**
 * delete a particular user
 * id: '_id' of user
 */
router.delete('/:userId', function(req, res, next) {
  let userId = req.params.userId;

  User.remove(
    { _id: userId},
    function(err, result) {
      if(err) {
        console.log(err);
        res.status(400).send('could not remove user');
      } else {
        Task.remove(
          { userId: userId },
          function(err, result) {
            if(err) {
              console.log(err);
              res.status(400).send('user removed. unable to remove user meta');
            } else {
              res.status(200).send('User Deleted');
            }
          }
        )
      }
    }
  );
});

//get all the user (debugging purpose)
router.get('/allusers', (req, res, next) => {
  User.find({}).then(result => {
    res.send(result)
  })
})
module.exports = router;