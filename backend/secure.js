module.exports = function(app) {
    var fs        = require('fs');
    var cookieParser = require('cookie-parser');
    var session = require('express-session');
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var models = require('./src/models');
    var SequelizeStore = require('connect-session-sequelize')(session.Store);
    var bCrypt = require('bcrypt-nodejs');
    const salt = '$2a$08$xulWdiRpc.s0zavA14rR2u';

    app.use(cookieParser());
    app.use(session({
        secret: 'supernova',
        saveUninitialized: true,
        resave: false,
        store: new SequelizeStore({db: models.sequelize})
        }));
    app.use(passport.initialize());
    app.use(passport.session());

    var securityConfig = __dirname + '/config/security.json';

    var usingLdap = fs.existsSync(securityConfig);
    if(usingLdap) {
        logger.info('ldap.json found, using ldap auth');
        var LdapStrategy = require('passport-ldapauth');
        passport.use(new LdapStrategy(require(securityConfig)));
    }

    passport.use('local', new LocalStrategy(function(username, password, done) {
        var encrypted = bCrypt.hashSync(password, salt, null);
        return models.user.findOne({where: {id: username}}).then(function(u) {
            return models.password.findOne({where: {userId: username}}).then(function(p) {
                if(p && p.password === encrypted) {
                    done(null, u);
                } else {
                    done('login failed', u);
                }
            });
        }, function(error) {
            logger.error('Authenticate failed: ', error);
        });
    }));

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


    app.post('/passport/login', function(req, res, next) {
        if (usingLdap) {
            passport.authenticate('ldapauth', function(err, user, info) {
                if (err || !user) {
                    return passport.authenticate('local', function (err, user, info) {
                        if (err) { return next(err); }
                        if (!user) { return res.json({"result": "failed"}); }
                        req.logIn(user, function(err) {
                            if (err) { return next(err); }
                            res.json({"result": "loggedin"});
                        });
                    })(req, res, next);
                }

                user['id'] = user['uid'];
                models.user.findByPk(user['id']).then(function(fu) {
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
            return;
        }

        passport.authenticate('local', function (err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.json({"result": "failed"}); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                res.json({"result": "loggedin"});
            });
        })(req, res, next);
    });

    app.get('/passport/logout', function(req, res) {
        req.logout();
        res.json({"result": "loggedout"});
    });

    require('./acl')(app);
};
