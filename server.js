var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

/* setting up connection */
const port = 3000;
app.listen(port, () => {
  console.log('server started @ ', port);
});

/* body-parser */
app.use(bodyParser.json()); //application/json
app.use(bodyParser.urlencoded({ extended: false })); //application/x-www-form-urlencoded

/* cors */
app.use(cors({origin: 'http://localhost:4200'}));

/* mongoose */
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const user = 'root';
const pass = 'pass';

const uri = "mongodb+srv://" + user + ":" + pass + "@cluster0-wrhtk.azure.mongodb.net/todoDB?retryWrites=true&w=majority";

mongoose.connect(uri, { promiseLibrary: require('bluebird'), useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

/* API */
app.use('/api/user', require('./routes/userRoute'));
app.use('/api/task', require('./routes/taskRoute'));