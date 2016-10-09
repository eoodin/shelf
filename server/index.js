/*jshint node:true*/
var express = require("express");
const app  = express();
const PORT = 4201;
app.set('port', PORT);
app.set('IP', '0.0.0.0');

var fs = require("fs"),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');
var models = require('../models');
models.sequelize.authenticate().then(function() {
    console.log('Db connected.')
}).catch(function(err){
    console.log('Unable to connect to db.', err);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(methodOverride('X-HTTP-Method-Override'));
require('./secure')(app);
require('./route')(app);

app.listen(PORT);
