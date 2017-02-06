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
                teamId: req.body.teamId
            }).then(function(plan) {
                console.log('plan created, add allocation');
                models.allocation.create({
                    teamId: req.body.teamId,
                    effort: req.body.availableHours,
                    planId: plan.id
                }).then(function(alloc) {
                    console.log('update plan for allocation');
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
