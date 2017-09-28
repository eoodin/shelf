/*jshint node:true*/
var cluster = require('cluster');
if (cluster.isMaster) {
  var cpuCount = require('os').cpus().length;
  console.log('master process started', new Date());
  for (var i = 0; i < cpuCount; i += 1) {
    console.log('start worker ' + (i+1), new Date());
    cluster.fork();
  }
} else {
  let workerId = cluster.worker.id;
  var express = require("express");
  const app = express();
  const DEFAULT_PORT = 4201;
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
    res.render('error', { error: err });
  })
  
  app.listen(httpPort);
  logger.log('info', 'Server worker ' + workerId + ' started.');
}
