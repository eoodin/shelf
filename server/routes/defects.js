module.exports = function(router) {
    var models = require('../models');

    function currentPlan(pid) {
        // TODO: the timezone difference between db and node could cause query failure.
        var now = new Date();
        return models.plan.findOne({
            where: {
                start: {$lt: now},
                end: {$gt: now},
                projectId: pid,
                type: 'sprint'
            }
        });
    }

    router.route('/defects')
        .get(function(req, res) {
            var ob = req.query.sortBy ? req.query.sortBy : 'id';
            // TODO: rename this field to eleminate the code.
            if (ob == 'owner') ob = 'ownerId';

            if (req.query.desc) {
                ob = [[ob, 'desc']]
            }
            let where = {};
            if (req.query.projectId) {
                where = {projectId: req.query.projectId};
            }

            if (req.query.status) {
                let status = req.query.status.split(',');
                where['status'] = {$in : status};
            }

            models.item.findAll({
                where: where,
                order: ob
            }).then(function(items) {   
                res.json(items);
            })
        })
        .post(function(req, res) {
            if (!req.body.projectId) {
                return res.sendStatus(404);
            }

            if (!req.user || !req.user.id) {
                return res.sendStatus(403);
            }

            models.user.findById(req.user.id).then(function(u) {
                let def = {
                    status: 'Created',
                    title: req.body.title,
                    description: req.body.description,
                    creatorId: u.id,
                    projectId: (req.body.projectId || null),
                    severity: req.body.severity
                };
                var item = models.item.build(def);
                item.save().then(function (item) {
                    res.json(item.id);
                })
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        });

    router.route('/defects/:id')
        .get(function(req, res) {
            models.item.findById(req.params.id).then(function(item) {
                res.json(item);
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        })
        .patch(function(req, res) {
            models.item.findById(req.params.id).then(function(item) {
                var origin = {};
                var changes = {};
                for(let f in req.body) {
                    if (f == 'updatedAt' || f == 'createdAt') {
                        continue;
                    }

                    if (item[f] != req.body[f]) {
                        origin[f] = item[f];
                        changes[f] = req.body[f];
                    }
                }

                item.update(changes).then(function(item) {
                    res.json(item);
                });
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        })
        .delete(function(req, res){
            models.item.findById(req.params.id).then(function(item) {
                item.destroy().then(function(item) {
                    res.json(req.params.id);
                })
                .catch(function(errors){
                     console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
                });
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        });



    router.route('/defects/:id/fix')
        .post(function(req, res) {
            models.sequelize.transaction(function(t) {
                return models.item.findById(req.params.id)
                    .then(function(defect) {
                        return currentPlan(defect.projectId).then(function(plan) {
                            if (!plan) {
                                throw new Error('Cannot locate current plan.');
                            }

                            return models.item.create({
                                type:'Task',
                                catalog:  'Development',
                                status: 'InProgress',
                                title: 'Fix defect #' + defect.id + ': ' + defect.title,
                                description: 'Auto-generated task for fixing issue #' + defect.id,
                                estimation: 8,
                                originalEstimation: 8,
                                projectId: defect.projectId,
                                ownerId: req.user.id,
                                parentId: defect.id,
                                planId: plan.id
                            }).then(function(task) {
                                // change log writing is missing, aspect programming?
                                return defect.update({status: 'InProgress', state: 'Fixing'});
                                res.json(task)
                            });
                        });
                    });
            }).then(function() {
                res.end();
            }).catch(function(errors) {
                console.log('Error caught: ', errors);
                res.sendStatus(500);
            });
        });

    router.route('/defects/:id/test')
        .post(function(req, res) {
            models.sequelize.transaction(function(t) {
                return models.item.findById(req.params.id).then(function(defect) {
                    return currentPlan(defect.projectId).then(function(plan) {
                        if (!plan) {
                            return res.status(501).json({error: 'Cannot locate current plan.'})
                        }

                        return models.item.create({
                            type:'Task',
                            catalog:  'Testing',
                            status: 'InProgress',
                            title: 'Test fix for defect #' + defect.id + ': ' + defect.title,
                            description: 'Auto-generated task for testing fixed issue #' + defect.id,
                            estimation: 8,
                            originalEstimation: 8,
                            projectId: defect.projectId,
                            ownerId: req.user.id,
                            parentId: defect.id,
                            planId: plan.id
                        }).then(function(task){
                            return defect.update({status: 'InProgress', state: 'Testing'}).then(function() {
                                res.json({});
                            });
                        });
                    });
                });
            }).then(function(){
                res.end();
            }).catch(function(errors) {
                console.log('Error caught: ', errors);
                res.sendStatus(500);
            });
        });
};
