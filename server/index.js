/*jshint node:true*/

// To use it create some files under `mocks/`
// e.g. `server/mocks/ember-hamsters.js`
//
// module.exports = function(app) {
//   app.get('/ember-hamsters', function(req, res) {
//     res.send('hello');
//   });
// };

module.exports = function(app) {
    var fs = require("fs"),
      express = require('express'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      session = require('express-session'),
      passport = require('passport'),
      LocalStrategy = require('passport-local');

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride('X-HTTP-Method-Override'));
    app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
    app.use(passport.initialize());
    app.use(passport.session());

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
        { passReqToCallback: true },
        function(req, username, password, done) {
           if(username == 'admin' && password == '123456') {
               req.session.success = 'You are logged in';
               return done(null, {'username': 'admin'});
           }

           req.session.error = 'Invalid credential.';
           return false;
        }));
    var ldapConf = __dirname + '/ldap.json';

    if(fs.existsSync(ldapConf)) {
        console.log('ldap.json found, using ldap auth');
        var LdapStrategy = require('passport-ldapauth');
        var ldapSetting = require(ldapConf);
        passport.use(new LdapStrategy(ldapSetting));
    }

    passport.serializeUser(function(user, done) {
        console.log('Serializing ' + user.username);
        don(null, user);
    });

    passport.deserializeUser(function(obj, done){
        console.log('deserializing ' + obj);
        done(null, obj);
    });

    var route = express.Router();
    
    route.get('/users/me', function(req, res) {
        res.send({username: 'admin', roles: ['basic-user']});
    });
    
    route.get('/app/info', function(req, res) {
        res.send({version: '1.0<faked>'});
    });
    
    route.get('/projects', function(req, res){
        res.send([]);
    });
    
    route.all('*', function(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        console.log('Unauthenticated access to ' + req.originalUrl);
        res.status(403).send({error: 'Unauthenticated'});
    });
    
    app.all('/index.html', function(req, res, next) {
      if (req.isAuthenticated()) { return next(); }
      req.session.error = 'Please sign in!';
      res.redirect('/login.html');
    });
    app.use("/api", route);
    app.use('/lib', express.static(__dirname + '/../node_modules/'));

    app.post('/login', passport.authenticate('local', {session: false}), function(req, res) {
        //res.send({status: 'ok'});
        res.redirect('/');
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login.html');
    });

    app.use(passport.initialize());
};

