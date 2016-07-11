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


    var route = express.Router();
    
    route.get('/app/info', function(req, res) {
        //TODO: reimplement this.
        res.send({"commit":"10c93e4","version":"1.0-SNAPSHOT","update":"31.05.2016 @ 22:25:09 CST"});
    });

    route.get('/users/me', function(req, res) {
        models.user.find({
                include: [models.role],
                where: {userId: 'jefliu'}}).then(function(user) {               
            res.send(user);
        });
    });
    
    route.get('/users/:uid/preferences', function(req, res){
        let uid = req.params.uid;
        if (!uid) {
            res.sendStatus(404);
            return;
        }
        
        //TODO: Load preferences
        res.send([]);
    });
    
    route.put('/users/:uid/preferences', function(req, res) {
        if (!req.query.name || !req.params.uiduid) {
            res.sendStatus(500);
            return;
        }
        
        // TODO: save preference
        res.send({status: 'OK'});
    });
    
    route.get('/teams/:tid/members', function(req, res){
        if (!req.params.tid) {
            res.status(404).send({error: 'Team ID not specified.'});
            return;
        }
        
        models.team.findOne({
            where: {id: req.params.tid},
            include: [models.user]
        }).then(function(team) {
            // TODO: rename team.users => team.members ?
            res.send(team.users);
        });

        
    });
    
    route.get('/projects', function(req, res){
        models.project.findAll({include: [models.team]})
            .then(function(projects) {
                res.send(projects);
        });
    });
    
    route.get('/plans/', function(req, res){
        let id = req.query.project;
        if (!id) {
            res.status(404).send({error: 'No project ID specified.'});
            return;
        }
        
        models.plan.findAll({where: {projectId: id}}).then(function(plans) {
            res.send(plans);
        });
    });

    route.post('/plans/', function(req, res){
        /*
         Project project = em.find(Project.class, spec.projectId);
        if (project == null)
            return null;

        Plan plan = new Plan();
        plan.setName(spec.name);
        plan.setType("sprint");
        plan.setStart(spec.start);
        plan.setEnd(spec.end);
        plan.setProject(project);
        em.persist(plan);

        Allocation allocation = new Allocation();
        allocation.setTeam(project.getTeam());
        allocation.setDeveloperHours(spec.devHours);
        allocation.setTesterHours(spec.tstHours);
        allocation.setSprint(plan);

        em.persist(allocation);
        return plan; 
         */
        console.log('data', req.rawBody);

        let id = req.rawBody.projectId;
        if (!id) {
            res.sendStatus(500);
            return;
        }
        
        models.project.findById(id).then(function(project) {
            console.log('project', project);
            res.send(project);
        });
    });
    
    route.get('/work-items/', function(req, res) {
        if (!req.query.planId) {
            //TODO: change planId as required param, and send 404 if not specified.
            res.send([]);
        }
        
        models.workItem.findAll({
            where: {planId: req.query.planId},
            include: [
                {model: models.user, as: 'owner'},
                {model: models.user, as: 'createdBy'}]
        }).then(function(items) {
            res.send(items);
        })
    });
    app.use("/api", route);
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
