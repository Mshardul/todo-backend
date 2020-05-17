var express = require('express');
var router = express.Router();
var authenticate = require('../authenticate');

var Task = require('../models/task');

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
      res.json(ret);
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

    res.json(ret);
  });
});

/**
 * add task, label, status of a particular user
 * id: _id of user
 * opt: {1, 2, 3}
 * val: val of task(json), label(string), or status(string)
 */
//commenting authenticate.verifyuser because right now we are not attaching beraer token with every request
router.post('/add', /*authenticate.verifyUser,*/ function(req, res, next) {
  console.log(req.body);
  let userId = req.body.id;
  let opt = req.body.opt;
  let val = req.body.val;
  console.log('-----> saving ', opt, ' as ', val, ' for id: ', userId);

  let ret = {};

  if(opt==1) {
    console.log('adding task');
    /* check_me */
    ret['task'] = JSON.parse(JSON.stringify(val)); //giving some kinda error
    console.log(ret['task']);
    //ret['task'] = { value: 'do it', label: 'lbl1', status: 'st1' };
  } else if(opt==2) {
    console.log('adding label');
    ret['label'] = val;
  } else if(opt==3) {
    console.log('adding status');
    ret['status'] = val;
  } else {
    console.log('wrong input');
  }

  console.log(ret);

  Task.updateOne( 
    { userId: userId },
    { $push: ret },
    { safe: true, upsert: true }, 
    function(err, result) {
      console.log('result ->' , result);
      console.log('err -> ',err);
    }
  );

  res.json(1);
  
});

/**
 * update task's value, label, status or all 3 for a particular user
 * id: _id of user
 * note: _id of note
 * opt: {0, 1, 2, 3} - what to update
 * val: value of task(string), label(string), status(string)
 */
//commenting authenticate.verifyuser because right now we are not attaching beraer token with every request
router.post('/update', /*authenticate.verifyUser,*/ function(req, res, next) { //method not working yet
  console.log(req.body);

  let userId = req.body.id;
  let noteId = req.body.note;
  /* check_me: should we use this, or get all 3 from front end by default - old values in case value doesn't change */
  let opt = req.body.opt;
  let val = req.body.val;

  console.log('-----> updating', opt, 'as', val, 'for id:', userId);

  let ret = {};

  if(opt==1) {
    console.log('updating task');
    ret
  } else if(opt==2) {
    console.log('updating label');
    Task.update( {id: userId},
      { $set: { label: val } },
      { upsert: false },
      function(err) { console.log(err); }
    );
  } else if(opt==3) {
    console.log('updating status');
  } else {
    console.log('wrong input');
  }
})

//get all the user (debugging purpose)
router.get('/alltasks', (req, res, next) => {
  Task.find({}).then(result => {
    res.send(result)
  })
})
module.exports = router;