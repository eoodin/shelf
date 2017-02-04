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
        models.team.findById(req.body.teamId).then(function(t) {
            models.plan.create({
                type: 'sprint',
                name: req.body.name,
                start: req.body.start,
                end: req.body.end,
                teamId: t.id
            }).then(function(plan) {
                models.allocation.create({
                    teamId: t.teamId,
                    effort: req.body.availableHours,
                    planId: plan.id
                }).then(function(alloc) {
                    plan.save({allocation: alloc}).then(function() {
                        res.json(plan);
                    });
                });
            });
        }).catch(function(err) {
            res.sendStatus(500);
        });
    });
};
