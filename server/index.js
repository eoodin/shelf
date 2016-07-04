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
    app.use(bodyParser.json());
    app.use(methodOverride('X-HTTP-Method-Override'));
    app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
    app.use(passport.initialize());
    app.use(passport.session());

    var databaseReady = false;
    models.sequelize.sync().then(function() {
        console.log('database initialized.');
        databaseReady = true;
    });

    app.use(function(req, res, next){
      var err = req.session.error,
        msg = req.session.notice,
        success = req.session.success;

      delete req.session.error;
      delete req.session.success;
      delete req.session.notice;

      if (err) res.locals.error = err;
      if (msg) res.locals.notice = msg;
      if (success) res.locals.success = success;

      next();
    });

    passport.use('local', new LocalStrategy(
        function(username, password, done) {
            return models.User.find({where: {userId: username}}).then(function(u) {
                done(null, u);
            }, function(error) {
                console.log('Authenticate failed: ', error);
            });
        }));
    var ldapConf = __dirname + '/ldap.json';

    if(fs.existsSync(ldapConf)) {
        console.log('ldap.json found, using ldap auth');
        var LdapStrategy = require('passport-ldapauth');
        var ldapSetting = require(ldapConf);
        passport.use(new LdapStrategy(ldapSetting));
    }

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done){
        done(null, obj);
    });

    var route = express.Router();
    
    route.get('/users/me', function(req, res) {
        models.User.find({where: {userId: 'jefliu'}}).then(function(user) {
            res.send(user);
        });
    });
    
    route.get('/app/info', function(req, res) {
        //TODO: reimplement this.
        res.send({"commit":"10c93e4","version":"1.0-SNAPSHOT","update":"31.05.2016 @ 22:25:09 CST"});
    });
    
    route.get('/users/:userId/preferences', function(req, res){
        let userId = req.params.userId;
        if (!userId) {
            res.status(404).send({error: 'User ID not specified.'});
            return;
        }
        
        //TODO: Load preferences
        res.send([]);
    });
    
    route.put('/users/:userId/preferences', function(req, res) {
        let uid = req.user.userId;
        if (!req.query.name || !uid) {
            res.status(500).send({error: 'no entry or user name specified.'})
        }
        
        // TODO: save preference
        res.send({status: 'OK'});
    });
    
    route.get('/projects', function(req, res){
        models.Project.findAll().then(function(projects) {
            res.send(projects);
        });
    });
    
    route.get('/plans/', function(req, res){
        let projectId = req.query.project;
        if (!projectId) {
            res.status(404).send({error: 'No project ID specified.'});
            return;
        }
        
        models.Plan.findAll({where: {project_id: projectId}}).then(function(plans) {
            res.send(plans);
        });
    });
    
    route.get('/work-items/', function(req, res) {
        if (!req.query.planId) {
            //TODO: load all  work items.
            res.send([]);
        }
        
        //TODO:
        res.send([]);
    });
    
    app.all('/api/*', function(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        console.log('Unauthenticated access to ' + req.originalUrl);
        res.status(403).send({error: 'Unauthenticated'});
    });
    
    app.all('/', function(req, res, next) {
      if (req.isAuthenticated()) { return next(); }
      //  req.session.error = 'Please sign in!';
      res.redirect('/login.html');
    });
    app.use("/api", route);
    app.use('/lib', express.static(__dirname + '/../node_modules/'));

    app.post('/login', passport.authenticate('local', { failureRedirect: '/login.html' }), function(req, res) {
        res.send({status: 'ok'});
        // res.redirect('/');
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login.html');
    });

    app.use(passport.initialize());
    app.use(passport.session());
};

