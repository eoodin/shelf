module.exports = function(route) {
    var models = require('../../models');
    route.get('/', function(req, res){
        models.project.findAll({include: [models.team]})
            .then(function(projects) {
                res.send(projects);
        });
    });
}