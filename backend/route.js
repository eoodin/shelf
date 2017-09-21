module.exports = function(app) {
    var path      = require('path');
    var express = require('express');
    var router = express.Router();
    var fs        = require('fs');

    let routesFolder = __dirname + '/routes'
    fs.readdirSync(routesFolder)
        .filter(function(file) {
            return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
        })
        .forEach(function(file) {
            let subroute = require(path.join(routesFolder, file));
            subroute(router);
        });

    app.use("/api", router);
    app.use("/ckeditor", express.static(__dirname + '/node_modules/ckeditor'));
};
