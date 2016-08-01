/*jshint node:true*/

module.exports = function(app) {
    var fs = require("fs"),
      express = require('express'),
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
    app.use('/vendor/ckeditor', express.static(__dirname + '/../node_modules/ckeditor'));
};
