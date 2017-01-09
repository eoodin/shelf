module.exports = function(router) {
    var models = require('../models');
    var route = router.route('/plans');
    route.get(function(req, res){
        let tid = req.query.team;
        if (!tid) {
            res.sendStatus(404);
            return;
        }

        models.plan.findAll({
            include: [models.allocation],
            where: {
                teamId: tid,
                type: 'sprint'
                }})
            .then(function(plans) {
                res.json(plans);
            }).catch(function(errors) {
                console.log('error' + JSON.stringify(errors));
                res.sendStatus(500);
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
                    effort: req.body.availableHours,
                    planId: plan.id
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
};
