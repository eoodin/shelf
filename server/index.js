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
    var fs = require("fs");
    var express = require("express");
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy(
        function(username, password, done) {
           if(username == 'admin' && password == '123456') {
               return done(null, null);
           }
           return false;
        }));
    var ldapConf = __dirname + '/ldap.json';

    if(fs.existsSync(ldapConf)) {
        console.log('ldap.json found, using ldap auth');
        var LdapStrategy = require('passport-ldapauth');
        var ldapSetting = require(ldapConf);
        passport.use(new LdapStrategy(ldapSetting));
    };

    var route = express.Router();
    route.get("/hello", function(req, res) {
        res.send({"message": "Hello ember"});
    });

    app.use("/api", route);
    app.use(passport.initialize());
    app.post('/login', passport.authenticate('ldapauth', {session: false}), function(req, res) {
        res.send({status: 'ok'});
    });

    // Expose lib to client
    app.use('/lib', express.static(__dirname + '/../node_modules/'));
};

