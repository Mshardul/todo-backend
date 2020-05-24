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

//commenting authenticate.verifyuser because right now we are not attaching beraer token with every request
//'tasks' = [task: json = [value: string, date: date, label: string, status: string]], [label: string], [status: string]

/**
 * get task, label, status or all 3 of a particular user
 * id: '_id' of user or 'userId' of tasks
 * opt: number = {0, 1, 2, 3} - what to obtain
 */
router.get('/:id/:opt', /*authenticate.verifyUser,*/ function(req, res, next) {
  let userId = req.params.id;
  let opt = req.params.opt;

  Task.find( {userId: userId}, function(err, task) {
    if(err) {
      console.log(err);
      res.status(400).send(err.code);
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
 * id: string =  '_id' of user or 'userId' of tasks
 * val: json = { //one or more
    "task": {"value": "v", "label": "l", "status": "s"}, 
    "label": "l2", 
    "status": "s2"  
  }
 */
router.post('/add', /*authenticate.verifyUser,*/ function(req, res, next) {
  console.log(req.body.val)
  let userId = req.body.userId;
  let val = JSON.parse(JSON.stringify(req.body.val));

  Task.updateOne( 
    { userId: userId },
    { $push: val },
    { safe: true, upsert: true }, 
    function(err, result) {
      if(err) {
        console.log(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.send({success: false, status: 'Unable to create the task'})
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send({success: true, status: 'Task created successfully'})

      }
    }
  );
});

/**
 * update task's value, label, status or all 3 for a particular user
 * userid: string = '_id' of user or 'userId' of tasks
 * taskId: string = '_id' of particular task
 * val: json = { //one or more
    "value": "v_new", 
    "status": "s_new", 
    "label": "l_new" 
  }
 */
router.post('/update', /*authenticate.verifyUser,*/ function(req, res, next) {
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

  Task.updateOne(
    // { $and: [ { 'userId': userId }, { 'task.id': taskId } ] }, // check_me: something's wrong here - although i don't think it is required
    { 'task._id': taskId },
    { '$set': ret },
    function(err, done) {
      if(err) {
        console.log(err);
        res.status(400).send(err.code);
      } else {
        res.sendStatus(200);
      }
    }
  )
});

/**
 * delete particular task, label, status
 * id: string = '_id' of tasks
 * opt: number = {1, 2, 3}
 * val: number|string = 'id' of particular task or label or status
 */
router.delete('/:opt/:id/:val', function(req, res, next) {
  let opt = req.params.opt;
  let id = req.params.id;
  var val = req.params.val;

  let ret = {};

  if(opt==1) {
    ret['task'] = { '_id': val };
  } else if(opt==2) {
    ret['label'] = val;
  } else if(opt==3) {
    ret['status'] = val;
  } else {
    res.sendStatus(403);
  }

  Task.updateOne(
    { _id: id },
    { $pull: ret },
    function(err, result) {
      if(err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    }
  );
});

/**
 * delete all task or all label or all status or all the 3
 * userId: string = '_id' of user or 'userId' of tasks
 * opt: number = {0, 1, 2, 3}
 */
router.delete('/:opt/:userId', function(req, res, next) {
  let opt = req.params.opt;
  let userId = req.params.userId;

  console.log(req.params);

  let ret = {};

  if(opt==1) {
    ret['task'] = [];
  } else if(opt==2) {
    ret['label'] = [];
  } else if(opt==3) {
    ret['status'] = [];
  } else if(opt==0) {
    ret['task'] = [];
    ret['label'] = [];
    ret['status'] = [];
  } else {
    res.sendStatus(403);
  }

  console.log(ret);

  Task.updateOne(
    { userId: userId },
    { $set: ret },
    function(err, result) {
      if(err) {
        console.log('err: ', err);
        res.sendStatus(400);
      } else {
        console.log('result: ', result);
        res.sendStatus(200);
      }
    }
  );
});

/**
 * get task corresponding to a particular attribute (label or status)
 * userid: string = '_id' of user or 'userId' of tasks
 * val: json = { //one of the following
    "value": "v",
    "status": "s"
  }
 */
router.post('/attr', function(req, res, next) {
  console.log(req.body);
  let userId = req.body.userId;
  let val = JSON.parse(JSON.stringify(req.body.val));

  let ret = [
    { '$unwind': '$task' },
    { '$match': {} },
    { '$project': {'task': 1} }
  ];

  let v = '';
  if(val.hasOwnProperty('label')) {
    v = val['label'];
    ret[1]['$match'] = {'task.label': v};
  } else if(val.hasOwnProperty('status')) {
    v = val['status'];
    ret[1]['$match'] = {'task.status': v};
  }

  console.log('ret ->',ret);

  Task.aggregate(
    [ ret ],
    function(err, task){
      console.log(task);
      console.log(err);
      res.send(task);
    }
  );
});

//get all the tasks (debugging purpose)
router.get('/alltasks', (req, res, next) => {
  Task.find({}).then(result => {
    res.send(result)
  })
})
module.exports = router;