/*jshint node:true*/
var cluster = require('cluster');
const DEFAULT_PORT = 4201;

if (cluster.isMaster) {
  var cpuCount = require('os').cpus().length;
  console.log('master process started', new Date());
  function startWorkerProcess(id) {
    console.log('start worker ', new Date(), id);
    let worker = cluster.fork();
    worker.on('exit', startWorkerProcess);
  }

  let production = process.env.NODE_ENV == 'production';
  if (!production) 
    startWorkerProcess('dev');

  for (var i = 0; production && i < cpuCount; i += 1)
    startWorkerProcess(i+1);
} else {
  let workerId = cluster.worker.id;
  var express = require("express");
  const app = express();
  var httpPort = process.env.PORT || DEFAULT_PORT;
  var logFolder = process.env.LOGDIR || '.';
  
  app.set('port', httpPort);
  app.set('IP', '0.0.0.0');
  logger = require('winston');
  let logPath = logFolder + '/server-worker-' + workerId + '.log';
  logger.configure({
      transports: [ new (logger.transports.File)({ filename: logPath}) ]
    });
  
  var fs = require("fs"),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override');
  
  var models = require('./models');
  models.sequelize.authenticate().then(function () {
      logger.log('info', 'database connected');
  }).catch(function (err) {
      logger.error('Unable to connect to db.', err);
  });
  
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json({ type: 'application/json' }));
  app.use(methodOverride('X-HTTP-Method-Override'));
  require('./secure')(app);
  require('./route')(app);
  // Error handler
  app.use(function (err, req, res, next) {
    logger.error(err.stack);
    if (res.headersSent) {
      return next(err);
    }
  
    res.status(500);
    res.json({ error: err });
  })
  
  app.listen(httpPort);
  logger.log('info', 'Server worker ' + workerId + ' started.');
}
