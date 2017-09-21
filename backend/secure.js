module.exports = function(app) {
    var fs        = require('fs');
    var cookieParser = require('cookie-parser');
    var session = require('express-session');
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var models = require('./models');

    app.use(cookieParser());
    app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
    app.use(passport.initialize());
    app.use(passport.session());

    var securityConfig = __dirname + '/../config/security.json';

    var usingLdap = fs.existsSync(securityConfig);
    if(usingLdap) {
        logger.info('ldap.json found, using ldap auth');
        var LdapStrategy = require('passport-ldapauth');
        passport.use(new LdapStrategy(require(securityConfig)));
    }
    else {
        passport.use('local', new LocalStrategy(function(username, password, done) {
            return models.user.find({where: {id: username}}).then(function(u) {
                done(null, u);
            }, function(error) {
                logger.error('Authenticate failed: ', error);
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
        logger.warn('Unauthenticated access to ' + req.originalUrl);
        res.status(403).send({error: 'Unauthenticated'});
    });

    app.all('/', function(req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            }
        });

    if (usingLdap) {
        app.post('/passport/login', function(req, res, next) {
            passport.authenticate('ldapauth', function(err, user, info) {
                if (err) { return next(err); }
                if (!user) { return res.json({"result": "failed"}); }
                user['id'] = user['uid'];
                models.user.findById(user['id']).then(function(fu) {
                    if (!fu) {
                        models.user.create({
                            id: user['id'],
                            name: user['displayName'],
                            email: user['mail']
                        }).then(function(u) {
                            logger.info('user created', u);
                        });
                    }
                }).catch(function(errors) {
                    logger.error(errors);
                });

                req.logIn(user, function(err) {
                    if (err) { return next(err); }
                    res.json({"result": "loggedin"});
                });
            })(req, res, next);
        });
    }
    else {
        app.post('/passport/login', function(req, res, next) {
            let auth = passport.authenticate('local');
            auth(req, res, next);
        }, function(req, res) {
            res.json({"result": "loggedin"});
        });
    }

    app.get('/passport/logout', function(req, res) {
        req.logout();
        res.json({"result": "loggedout"});
    });
};
