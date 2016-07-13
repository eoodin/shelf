/*jshint node:true*/

module.exports = function(app) {
    var fs = require("fs"),
      express = require('express'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override');
      
    var models = require('../models');


    app.use(bodyParser.urlencoded({ extended: false }));
    // app.use(bodyParser.json({ type: 'application/*+json' }));

    app.use(function(req, res, next) {
        if (!req.readable) {
            return next();
        }

        var rawBody = '';
        req.on('data', function(chunk) {
            rawBody += chunk;
        });
        req.on('end', function() {
            if (rawBody) req.rawBody = JSON.parse(rawBody);
            next(); 
        });
    });
    app.use(methodOverride('X-HTTP-Method-Override'));
    models.sequelize.sync().then(function() {
        console.log('Database synchronized.')
    });

    require('./secure.js')(app);
    app.use("/api", require('./route.js')());
    
    // TODO: 
    app.use('/lib', express.static(__dirname + '/../node_modules/'));


    
};
