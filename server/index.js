/*jshint node:true*/

module.exports = function(app) {
    var fs = require("fs"),
      express = require('express'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      session = require('express-session'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;
    var models = require('../models');

    app.use(cookieParser());
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

    app.use("/api", require('./route.js')());
    app.use('/lib', express.static(__dirname + '/../node_modules/'));


    app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
    app.use(passport.initialize());
    app.use(passport.session());

    var ldapConf = __dirname + '/ldap.json';

    if(fs.existsSync(ldapConf)) {
        console.log('ldap.json found, using ldap auth');
        var LdapStrategy = require('passport-ldapauth');
        var ldapSetting = require(ldapConf);
        passport.use(new LdapStrategy(ldapSetting));
    }
    else {
        passport.use('local', new LocalStrategy(function(username, password, done) {
            return models.user.find({where: {userId: username}}).then(function(u) {
                done(null, u);
            }, function(error) {
                console.log('Authenticate failed: ', error);
            });
        }));
    }

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done){
        done(null, obj);
    });
    
    app.all('/api/*', function(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        console.log('Unauthenticated access to ' + req.originalUrl);
        res.status(403).send({error: 'Unauthenticated'});
    });
    
    app.all('/', function(req, res, next) {
      if (req.isAuthenticated()) { return next(); }
      res.redirect('/login.html');
    });
    
    app.post('/login', passport.authenticate('local', { failureRedirect: '/login.html' }), function(req, res) {
        res.redirect('/');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login.html');
    });
};
