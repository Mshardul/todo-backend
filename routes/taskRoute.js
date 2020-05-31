var express = require('express');
var router = express.Router();
var authenticate = require('../authenticate');

var Task = require('../models/task');

/* val = {
  'task': <json> {
    'value': <string>
    'label': <string>
    'status': <string>
    'dueDate': <date>
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
 * getting tasks, either archieved or unarchieved
 * userId: '_id' of user or 'userId' of tasks
 * archieved: number = {1, 2}
 */
router.get('/tasks/:userId/:archieved', function (req, res, next) {
  let userId = req.params.userId;
  let archieved = req.params.archieved;

  console.log(userId, archieved);

  let ret = [
    { '$unwind': '$task' },
    { '$match': {} },
    { '$project': { 'task': 1 } }
  ];

  let cond = { $and: [{ 'userId': userId }, { 'task.archieved': false }] };

  let v = '';
  if (archieved == 1) {
    cond['$and'][1] = { 'task.archieved': true };
  }

  ret[1]['$match'] = cond;

  console.log('cond ->', cond);
  console.log('ret ->', ret);

  Task.aggregate(
    [ret],
    function (err, task) {
      console.log(task);
      console.log(err);
      res.send(task);
    }
  );

})

/**
 * get task, label, status or all 3 of a particular user
 * userId: '_id' of user or 'userId' of tasks
 * opt: number = {0, 1, 2, 3} - what to obtain
 */
router.get('/:userId/:opt', /*authenticate.verifyUser,*/ function (req, res, next) {
  let userId = req.params.userId;
  let opt = req.params.opt;
  Task.find({ userId: userId }, function (err, task) {
    if (err) {
      console.log(err);
      res.status(400).send(err.code);
    }

    let ret = {};

    if (task.length != 1) {
      ret['code'] = 0;
      ret['msg'] = 'Could not obtain data';
      res.status(400).send(ret);
    }

    console.log('task ->', task);

    if (opt == 1) {
      ret['task'] = task[0]['task'];
    } else if (opt == 2) {
      ret['label'] = task[0]['label'];
    } else if (opt == 3) {
      ret['status'] = task[0]['status'];
    } else if (opt == 0) {
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
 * userId: string =  '_id' of user or 'userId' of tasks
 * val: json = { //one or more
    "task": {"value": "<task_value>", "label": "<label_id>", "status": "<status_id>", "dueDate": "2020-05-26T18:30:00.000Z", "archieved": false},
    "label": "<label_value>" ,
    "status": "<label_value>"
  }
 */
router.post('/add', /*authenticate.verifyUser,*/ function (req, res, next) {
  console.log(req.body.val)
  let userId = req.body.userId;
  let val = JSON.parse(JSON.stringify(req.body.val));

  Task.updateOne(
    { userId: userId },
    { $push: val },
    { safe: true, upsert: true },
    function (err, result) {
      if (err) {
        console.log(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: false, status: 'Unable to create the task' });
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: true, status: 'Task created successfully' });
      }
    }
  );
});

/**
 * update task's value, label, status or all 3 for a particular user
 * userId: string = '_id' of user or 'userId' of tasks // check this - use userId instead of taskId 
 * taskId: string = '_id' of particular task
 * val: json = { //one or more
    "value": "v_new", 
    "status": "s_new", 
    "label": "l_new",
    "authenticate": true
  }
 */
router.post('/update', /*authenticate.verifyUser,*/ function (req, res, next) {
  let taskId = req.body.taskId;
  let val = JSON.parse(JSON.stringify(req.body.val));
  console.log(req.body);
  let ret = {};

  if (val.hasOwnProperty('value')) {
    ret['task.$.value'] = val['value'];
  }
  if (val.hasOwnProperty('label')) {
    ret['task.$.label'] = val['label'];
  }
  if (val.hasOwnProperty('status')) {
    ret['task.$.status'] = val['status'];
  }
  if (val.hasOwnProperty('dueDate')) {
    ret['task.$.dueDate'] = val['dueDate'];
  }
  if (val.hasOwnProperty('archieved')) {
    ret['task.$.archieved'] = val['archieved'];
  }
  console.log(ret)
  Task.updateOne(
    { 'task._id': taskId },
    { '$set': ret },
    function (err, done) {
      if (err) {
        console.log(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: false, status: 'Unable to update the task' })
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: true, status: 'Task updated successfully' })
      }
    }
  )
});

/**
 * update label and status of a particular user, along with update label and status for particular tasks
 * userId: string = '_id' of user, 'userId' of task
 * val: 
 * opt: number = {1, 2}
 */
router.post('/updateLabel', /*authenticate.verifyUser,*/ function (req, res, next) {
  let userId = req.body.userId;
  let val = JSON.parse(JSON.stringify(req.body.val));
  let tasks = JSON.parse(JSON.stringify(req.body.tasks));
  let opt = req.body.opt;

  let ret = { 'task': tasks };

  if(opt == 1) {
    ret['label'] = val;
  } else if(opt == 2) {
    ret['status'] = val;
  } else {
    res.status(400).send('Wrong choice');
  }

  Task.updateOne(
    { 'userId': userId },
    { '$set': ret },
    function(err, done) {
      if(err) {
        console.log(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: false, status: 'Unable to update' });
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: true, status: 'updated successfully' });
      }
    }
  );
});

/**
 * delete particular task, label, status
 * userId: string = '_id' of user, 'userId' of task
 * opt: number = {1, 2, 3}
 * val: number|string = 'id' of particular task or label or status
 */
router.delete('/:opt/:userId/:val', function (req, res, next) {
  console.log(req.params)
  let opt = parseInt(req.params.opt);
  let userId = req.params.userId;
  var val = req.params.val;

  let ret = {};

  if (opt == 1) {
    ret['task'] = { '_id': val };
  } else if (opt == 2) {
    ret['label'] = val;
  } else if (opt == 3) {
    ret['status'] = val;
  } else {
    res.sendStatus(403);
  }
  console.log(ret)
  Task.updateOne(
    { userId: userId },
    { $pull: ret },
    function (err, result) {
      if (err) {
        console.log(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: false, status: 'Unable to delete' })
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: true, status: 'deleted successfully' })
      }
    }
  );
});

/**
 * delete all task or all label or all status or all the 3
 * userId: string = '_id' of user or 'userId' of tasks
 * opt: number = {0, 1, 2, 3}
 */
router.delete('/:opt/:userId', function (req, res, next) {
  let opt = req.params.opt;
  let userId = req.params.userId;

  console.log(req.params);

  let ret = {};

  if (opt == 1) {
    ret['task'] = [];
  } else if (opt == 2) {
    ret['label'] = [];
  } else if (opt == 3) {
    ret['status'] = [];
  } else if (opt == 0) {
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
    function (err, result) {
      if (err) {
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
 * add label and status for the user
 * opt: number = {1, 2}
 * userId: string = '_id' of user or 'userId' of tasks
 * val: json = { //
 *    value: <label / status>
 * }
 */
router.post('/addNew', (req, res, next) => {
  let opt = req.body.opt;
  let userId = req.body.userId;
  let val = req.body.val;

  let ret = {};
  if(opt == 1) {
    ret['label'] = val;
  } else if(opt == 2) {
    ret['status'] = val;
  } else {
    ret['code'] = 0;
    ret['msg'] = 'Wrong option';
    res.status(400).send(ret);
  }

  Task.updateOne(
    { userId: userId },
    { $push: ret },
    { safe: true, upsert: true },
    function(err, result) {
      if (err) {
        console.log(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: false, status: 'Unable to create' });
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: true, status: 'created successfully' });
      }
    }
  );
})

/**
 * get task corresponding to a particular attribute (label or status)
 * userid: string = '_id' of user or 'userId' of tasks
 * val: json = { //one of the following
    "label": "l",
    "status": "s"
  }
 */
router.post('/attr', function (req, res, next) {
  console.log(req.body);
  let userId = req.body.userId;
  let val = JSON.parse(JSON.stringify(req.body.val));

  let ret = [
    { '$unwind': '$task' },
    { '$match': {} },
    { '$project': { 'task': 1 } }
  ];

  let cond = { $and: [{ 'userId': userId }] };

  let v = '';
  if (val.hasOwnProperty('label')) {
    v = val['label'];
    cond['$and'].push({ 'task.label': v });
  } else if (val.hasOwnProperty('status')) {
    v = val['status'];
    cond['$and'].push({ 'task.status': v });
  }

  ret[1]['$match'] = cond;

  Task.aggregate(
    [ret],
    function (err, task) {
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