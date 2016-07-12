module.exports = function() {
    var path      = require('path');
    var express = require('express');
    var route = express.Router();
    var fs        = require('fs');

    let routesFolder = __dirname + '/routes'
    fs.readdirSync(routesFolder)
        .filter(function(file) {
            return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
        })
        .map(function(file) {
            return file.substring(0, file.length - 3);
        })
        .forEach(function(name) {
            let subRoute = express.Router();
            require(path.join(routesFolder, name + '.js'))(subRoute);
            route.use('/' + name, subRoute);
        });

    return route;
}