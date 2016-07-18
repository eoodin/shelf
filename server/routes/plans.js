module.exports = function(router) {
    var models = require('../../models');
    var route = router.route('/plans');
    route.get(function(req, res){
        let id = req.query.project;
        if (!id) {
            res.sendStatus(404);
            return;
        }
        
        models.plan.findAll({where: {projectId: id}}).then(function(plans) {
            res.json(plans);
        });
    });

    route.post(function(req, res){
        if (!req.body.projectId) {
            res.sendStatus(500);
            return;
        }
        
        models.project.findById(req.body.projectId).then(function(project) {
            models.plan.create({
                type: 'sprint',
                name: req.body.name,
                start: req.body.start,
                end: req.body.end,
                projectId: project.id
            }).then(function(plan) {
                models.allocation.create({
                    teamId: project.teamId,
                    developerHours: req.body.devHours,
                    testerHours: req.body.tstHours,
                    plan: plan
                }).then(function(alloc) {
                    plan.save({allocation: alloc}).then(function() {
                        res.json(plan);
                    })
                })
            });
        }).catch(function(err) {
            res.sendStatus(500);
        });
    });
}