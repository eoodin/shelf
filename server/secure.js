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

    var securityConfig = __dirname + '/../config/security.json';

    var usingLdap = fs.existsSync(securityConfig);
    if(usingLdap) {
        console.log('ldap.json found, using ldap auth');
        var LdapAuth = require('ldapauth-fork');
        var conf = require(securityConfig);
        console.log("ldap setting: " + JSON.stringify(conf.server));
        var auth = new LdapAuth(conf.server);
        passport.use("ldapauth", new LocalStrategy(function(username, password, done) {
            auth.authenticate(username, password, function(err, user, info){
                if (err || !user) {
                    console.log('error: ' + JSON.stringify(err));
                    return done(null, false, {message: 'Failed to authenticate'});// todo
                }
                
                done(null, user);
            });
        }));
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
            // Automatic login
            // if (!req.isAuthenticated()) {
            //     let auth = passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login.html'});
            //     req.body.username = 'someuser';
            //     req.body.password = '123';
            //     return auth(req, res, next);
            // }
            if (req.isAuthenticated()) { return next(); }
            res.redirect('/login.html');
        });

    if (usingLdap) {
        app.post('/login', function(req, res, next) {
            passport.authenticate('ldapauth', 
                { successRedirect: '/', failureRedirect: '/login.html' },
                function(err, user, info) {
                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        return res.json({error: 'authentication failed'});
                    }
                    return res.json({error: 'authentication failed'});
                }
            )(req, res, next);
        });
    }
    else {
        app.post('/login', function(req, res, next) {
            let auth = passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login.html'});
            auth(req, res, next);
        });
    }
    
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login.html');
    });
}