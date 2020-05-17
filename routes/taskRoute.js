var express = require('express');
var router = express.Router();
var authenticate = require('../authenticate');

var Task = require('../models/task');

/* val = {
  'task': <json> {
    'value': <string>
    'label': <string>
    'status': <string>
  },
  'label': <string>,
  'status': <string>}
*/

/* opt:
  1: task,
  2: label,
  3: status,
  0: all three
*/

/**
 * get task, label, status or all 3 of a particular user
 * id: _id of user
 * opt: {0, 1, 2, 3} - what to obtain
 */

//commenting authenticate.verifyuser because right now we are not attaching beraer token with every request
router.get('/:id/:opt', /*authenticate.verifyUser,*/ function(req, res, next) {
  let userId = req.params.id;
  let opt = req.params.opt;
  console.log('-----> task ', opt, ' by id: ', userId);

  Task.find( {userId: userId}, function(err, task) {
    if(err) {
      let errCode = err.code;
      console.log("error: ", errCode);
      return next(err);
    }
    
    let ret = {};
    
    if(task.length!=1) {
      ret['code'] = 0;
      ret['msg'] = 'Could not obtain data';
      res.status(400).send(ret);
    }

    if(opt==1) {
      ret['task'] = task[0]['task'];
    } else if(opt==2) {
      ret['label'] = task[0]['label'];
    } else if(opt==3) {
      ret['status'] = task[0]['status'];
    } else if(opt==0) {
      ret['task'] = task[0]['task'];
      ret['label'] = task[0]['label'];
      ret['status'] = task[0]['status'];
    }
    else {
      ret['code'] = 0;
      ret['msg'] = 'Wrong Input';
    }

    res.status(200).send(ret);
  });
});

/**
 * add task, label, status of a particular user
 * id: _id of user
 * val: json - as per the rules
 */

//commenting authenticate.verifyuser because right now we are not attaching beraer token with every request
router.post('/add', /*authenticate.verifyUser,*/ function(req, res, next) {
  console.log(req.body);
  let userId = req.body.id;
  /*  */
  let val = JSON.parse(JSON.stringify(req.body.val));

  console.log(val);

  Task.updateOne( 
    { userId: userId },
    { $push: val },
    { safe: true, upsert: true }, 
    function(err, result) {
      if(err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    }
  );

  res.json(1);
  
});

/**
 * update task's value, label, status or all 3 for a particular user
 * id: _id of user
 * note: _id of task
 * val: json - as per the rules
 */

//commenting authenticate.verifyuser because right now we are not attaching beraer token with every request
router.post('/update', /*authenticate.verifyUser,*/ function(req, res, next) { //method not working yet
  let userId = req.body.userid;
  let taskId = req.body.taskId;
  let val = JSON.parse(JSON.stringify(req.body.val));

  let ret = {};

  if(val.hasOwnProperty('value')) {
    ret['task.$.value'] = val['value'];
  }
  if(val.hasOwnProperty('label')) {
    ret['task.$.label'] = val['label'];
  }
  if(val.hasOwnProperty('status')) {
    ret['task.$.status'] = val['status'];
  }

  console.log(ret);
  Task.updateOne(
    // { $and: [ { 'userId': userId }, { 'task.id': taskId } ] }, // check_me: something's wrong here - although i don't think it is required
    { 'task._id': taskId },
    { '$set': ret },
    function(err, done) {
      if(err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    }
  )
})

//get all the tasks (debugging purpose)
router.get('/alltasks', (req, res, next) => {
  Task.find({}).then(result => {
    res.send(result)
  })
})
module.exports = router;