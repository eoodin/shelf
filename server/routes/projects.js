module.exports = function(router) {
    var models = require('../../models');
    
    router.route('/projects').get(function(req, res){
        models.project.findAll({include: [models.team]})
            .then(function(projects) {
                res.json(projects);
        });
    });
}