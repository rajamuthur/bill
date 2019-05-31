const express = require('express');
const app = express();
const apiRouter = require('./api/routes');
const config = require('./config');
const path = require('path');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
// app.use(express.json());

// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

app.use(fileUpload());
var DBCONFIG = config.DB_CONFIG;
var APPCONSTANTS = config.APP_CONSTANTS;
var STATUS_CODE = APPCONSTANTS.STATUS_CODE;
var ClientRoutes = require('./api/middleware/client_routing');
//Connect to DB
var mongoose = require('mongoose');
// mongoose.connect('mongodb://' + DBCONFIG.DB_SERVER + ':' + DBCONFIG.DB_PORT + '/' + DBCONFIG.DB_NAME, { useNewUrlParser: true });
mongoose.connect('mongodb+srv://raja:iYM6rlXQ0uGmFMTL@cluster0-3dcry.mongodb.net/event?retryWrites=true', { useNewUrlParser: true });
//mongoose.connect('mongodb+srv://' + DBCONFIG.DB_USERNAME + ':' + DBCONFIG.DB_PASSWORD + '@cluster0-3dcry.mongodb.net'+'/' + DBCONFIG.DB_NAME + '?retryWrites=true', { useNewUrlParser: true });

//Debug
mongoose.set("debug", (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});

var db = mongoose.connection;
db.on('error', function (req, resp) {
  console.log("Failed to connect DB");
  process.exit(1);
});

db.once('open', function () {
  console.log("Connected to database");
});

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// error handler
app.use(function (err, req, resp, next) {
  console.log('error: ', err);
  resp.status(500).send('Unable to process the request....')
});

app.get('/', (req, resp) => {
  resp.send('Welcome:::');
});

app.use('/api', apiRouter(express.Router()));

app.use(express.static('client')); //Web Client routes
app.use(express.static(path.join(__dirname, 'client'))); //Web Client routes
app.use(express.static('files')); //Web Client routes

//app.use(ClientRoutes(path.join(__dirname, 'client', 'index.html'))); //\ accepts the file path which is served against the matching routes/rules

const port = process.env.PORT || APPCONSTANTS.SITE_CONFIG.SITE_PORT;
app.listen(port, () => console.log(`Listening port ${port}`));