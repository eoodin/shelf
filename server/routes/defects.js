module.exports = function(router) {
    var models = require('../models');

    router.route('/defects')
        .get(function(req, res) {
            var ob = req.query.sortBy ? req.query.sortBy : 'id';
            // TODO: rename this field to eleminate the code.
            if (ob == 'owner') ob = 'ownerId';

            if (req.query.desc) {
                ob = [[ob, 'desc']]
            }
            let where = {};
            if (req.query.project) {
                where = {projectId: req.query.project};
            }

            if (req.query.status) {
                let status = req.query.status.split(',');
                where['status'] = {$in : status};
            }

            models.defect.findAll({
                where: where,
                order: ob,
                include: [{model: models.user, as: 'owner'}]
            }).then(function(defects) {   
                res.json(defects);
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
                    status: 'Open',
                    title: req.body.title,
                    description: req.body.description,
                    creatorId: u.id,
                    projectId: (req.body.projectId || null),
                    severity: req.body.severity
                };
                var defect = models.defect.build(def);
                defect.save().then(function (defect) {
                    res.json(defect.id);
                })
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        });

    router.route('/defect/:id')
        .get(function(req, res) {
            models.defect.findById(req.params.id).then(function(d) {
                res.json(d);
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        })
        .patch(function(req, res) {
            models.defect.findById(req.params.id).then(function(d) {
                var origin = {};
                var changes = {};
                for(let f in req.body) {
                    if (f == 'updatedAt' || f == 'createdAt') {
                        continue;
                    }

                    if (d[f] != req.body[f]) {
                        origin[f] = d[f];
                        changes[f] = req.body[f];
                    }
                }

                d.update(changes).then(function(d) {
                    res.json(d);
                });
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        })
        .delete(function(req, res){
            models.defect.findById(req.params.id).then(function(d) {
                d.destroy().then(function(d) {
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

    router.route('/defect/:id/fix')
        .post(function(req, res) {
            if (!req.body.planId) {
                res.sendStatus(404);
                return;
            }

            models.sequelize.transaction(function(t) {
                return models.defect.findById(req.params.id)
                    .then(function(defect) {
                        return models.task.create({
                                status: 'InProgress',
                                title: 'Fix defect #' + defect.id + ': ' + defect.title,
                                description: 'Auto-generated task for fixing issue #' + defect.id,
                                estimation: 8,
                                originalEstimation: 8,
                                ownerId: req.user.id,
                                creatorId: req.user.id,
                                planId: req.body.planId
                            }).then(function(task) {
                                // change log writing is missing, aspect programming?
                                return defect.update({status: 'Fixing', ownerId: req.user.id}).then(function() {
                                    res.json(task);
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

    router.route('/defect/:id/test')
        .post(function(req, res) {
            if (!req.body.planId) {
                res.sendStatus(404);
            }

            models.sequelize.transaction(function(t) {
                return models.defect.findById(req.params.id).then(function(defect) {
                    return models.task.create({
                            status: 'InProgress',
                            title: 'Test fix for defect #' + defect.id + ': ' + defect.title,
                            description: 'Auto-generated task for testing fixed issue #' + defect.id,
                            estimation: 8,
                            originalEstimation: 8,
                            ownerId: req.user.id,
                            creatorId: req.user.id,
                            planId: req.body.planId
                        }).then(function(task){
                            return defect.update({status: 'Testing', ownerId: req.user.id}).then(function() {
                                res.json({});
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
