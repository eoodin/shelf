module.exports = function(router) {
    var models = require('../models');

    router.route('/projects').get(function(req, res){
        models.project.findAll({include: [models.team, models.release]})
            .then(function(projects) {
                res.json(projects);
        });
    });

    router.route('/project/:id/release').post((req, res) => {
        return models.project.findById(req.params.id).then(p => {
            let r = { projectId: p.id, name: req.body.name, targetDate: req.body.targetDate };
            logger.info("creating release", r);
            return models.release.create(r).then(() => {
                res.json({"result": "created"});
                logger.info("release created.");
            });
        });
    });

    router.route('/project/:id/details').get((req, res) => {
        return models.project.findById(req.params.id, {include: [models.team, models.release]})
            .then(p => {
            res.json(p);
        });
    });
};
