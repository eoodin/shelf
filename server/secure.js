module.exports = function(app) {
    var fs        = require('fs');
    var cookieParser = require('cookie-parser');
    var session = require('express-session');
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var models = require('../models');
    
    app.use(cookieParser());
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
        if (!req.isAuthenticated()) {
            let auth = passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login.html'});
            req.body.username = 'jefliu';
            req.body.password = '123';
            return auth(req, res, next);
        }

        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login.html');
    });
    
    /*
    app.post('/login', passport.authenticate('local', { failureRedirect: '/login.html' }), function(req, res) {
        res.redirect('/');
    });
    */
    app.post('/login', function(req, res) {
        let auth = passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login.html'});
        auth(req, res);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login.html');
    });
}