var express = require('express');
var router = express.Router();

var Task = require('../models/task');

router.get('/:id/:opt', function(req, res, next) {
  let userId = req.params.id;
  let opt = req.params.opt;
  console.log('-----> task ', opt, ' by id: ', userId);

  Task.find( {userId: userId}, function(err, docs) {
    if(err){
      let errCode = err.code;
      console.log("error: ", err.code);
      return next(err);
    }
    
    let ret = {};
    
    if(docs.length!=1){
      ret['code'] = 0;
      ret['msg'] = 'Could not obtain data';
      res.json(ret);
    }

    if(opt==1) {
      ret['task'] = docs[0]['task'];
    } else if(opt==2) {
      ret['label'] = docs[0]['label'];
    } else if(opt==3) {
      ret['status'] = docs[0]['status'];
    } else if(opt==0) {
      ret['task'] = docs[0]['task'];
      ret['label'] = docs[0]['label'];
      ret['status'] = docs[0]['status'];
    }
    else {
      ret['code'] = 0;
      ret['msg'] = 'Wrong Input';
    }

    res.json(ret);
  });
});

router.post('/', function(req, res, next) {
  console.log(req.body);
  let userId = req.body.id;
  let opt = req.body.opt;
  let val = req.body.val;
  console.log('-----> saving ', opt, ' as ', val, ' for id: ', userId);

  if(opt==1) {
    console.log('adding task');
  } else if(opt==2) {
    console.log('adding label');
    Task.update( {id: userId},
      { $set: { label: val } },
      { upsert: false },
      function(err) { console.log(err); }
    );
  } else if(opt==3) {
    console.log('adding status');
  } else {
    console.log('wrong input');
  }
});
module.exports = router;