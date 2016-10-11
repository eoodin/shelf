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
        var LdapStrategy = require('passport-ldapauth');
        passport.use(new LdapStrategy(require(securityConfig)));
    }
    else {
        passport.use('local', new LocalStrategy(function(username, password, done) {
            return models.user.find({where: {id: username}}).then(function(u) {
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
            //Automatic login
            // if (!usingLdap && !req.isAuthenticated()) {
            //     let auth = passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login.html'});
            //     req.body.username = 'jefliu';
            //     req.body.password = '1';
            //     return auth(req, res, next);
            // }

            if (req.isAuthenticated()) {
                // check and create user in database
                // fields fetched from ldap: user.mail, user.displayName, user.employeeNumber
                return next();
            }
        });

    if (usingLdap) {
        app.post('/passport/login', function(req, res, next) {
            passport.authenticate('ldapauth', function(err, user, info) {
                if (err) { return next(err); }
                if (!user) { return res.json({"result": "failed"}); }
                user['id'] = user['uid'];
                models.user.findById(user['id']).then(function(user) {
                    if (!user) {
                        models.user.create({
                            id: user['id'],
                            name: user['displayName'],
                            email: user['mail']
                        }).then(function(u) {
                            console.log('Successful login new user, created.');
                        });
                    }
                }).catch(function(errors) {
                    console.log('Error', errors);
                });

                req.logIn(user, function(err) {
                    if (err) { return next(err); }
                    return res.redirect('/');
                });
            })(req, res, next);
        });
    }
    else {
        app.post('/passport/login', function(req, res, next) {
            let auth = passport.authenticate('local');
            auth(req, res, next);
        }, function(req, res) {
            res.redirect('/');
        });
    }

    app.get('/passport/logout', function(req, res) {
        req.logout();
        res.json({"result": "loggedout"});
    });
};
