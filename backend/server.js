/*jshint node:true*/
var express = require("express");
const app = express();
const PORT = 4201;
app.set('port', PORT);
app.set('IP', '0.0.0.0');
logger = require('winston');
logger.configure({
    transports: [
      // new (logger.transports.Console)(),
      new (logger.transports.File)({ filename: 'shelf.log' })
    ]
  });

var fs = require("fs"),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

var models = require('./models');
models.sequelize.authenticate().then(function () {
    logger.log('info', 'database connected, sync schema...');
    models.sequelize.sync();
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

app.listen(PORT);
