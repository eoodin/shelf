module.exports = function(router) {
    var models = require('../models');

    function composeWhere(req) {
        let where = {};
        let excludeStatus = [];
        
        if (req.query.project) {
            where['projectId'] = req.query.project;
        }
        
        if (req.query.noclosed == 'true') {
            excludeStatus.push('Closed');
        }

        if (req.query.nodeclined == 'true') {
            excludeStatus.push('Declined');
        }

        if (excludeStatus.length) {
            where['status'] = {$notIn: excludeStatus}
        }
        if (req.query.ownonly == 'true') {
            where['ownerId'] = req.user.id;
        }
        return where;
    }

    router.route('/defects')
        .get(function(req, res) {
            let ex = (req.query.exclude) ? req.query.exclude : [];
            var orderField = req.query.sortBy ? req.query.sortBy : 'id';
            if (orderField == 'owner') orderField = 'ownerId';
            else if (orderField == 'creator') orderField = 'creatorId';

            return models.defect.findAndCountAll({
                attributes: {exclude: ex},
                where: composeWhere(req),
                order: [
                    [orderField, (req.query.desc ? 'desc' : 'asc')]],
                include: [{
                    model: models.defectComment, 
                    limit: 1,
                    order: [['commentId', 'desc']],
                    include: [{model: models.comment}]
                }]
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
                logger.error(JSON.stringify(errors));
                res.sendStatus(500);
            });
        });

    router.route('/defects/summary')
        .get(function(req, res) {
            var pid = req.query.project;
            models.defect.findAndCountAll({
                attributes: ['status', 'severity'],
                where: {projectId: req.query.project}
            }).then(function(ds) {
                res.json({
                    total: ds.count,
                    open: ds.rows.filter(d => d.status == 'Open').length,
                    closed: ds.rows.filter(d => d.status == 'Closed').length,
                    declined: ds.rows.filter(d => d.status == 'Declined').length,
                    fixing: ds.rows.filter(d => d.status == 'Fixing').length,
                    fixed: ds.rows.filter(d => d.status == 'Fixed').length,
                    testing: ds.rows.filter(d => d.status == 'Testing').length,
                    failed: ds.rows.filter(d => d.status == 'Failed').length
                });
            });
        });
    
    router.route('/defects/:id')
        .get(function(req, res) {
            models.defect.findOne({
                where: { id: req.params.id },
                include: [{
                    model: models.defectHistory, 
                    as: 'histories', 
                    attributes: ['historyId'], /* any way to exlcude all attributes */
                    order:  [['createdAt', 'asc']],
                    include: [{
                        model: models.history, 
                        include: [{
                            model: models.change, 
                            attributes: ['field', 'value'],
                        }]
                    }]
                }]
            }).then(function(d) {
                //TODO sort history in db instead of this code:
                if(d.histories) {
                    d.histories = d.histories.sort(
                        (a, b) => a.history.createdAt > b.history.createdAt
                    );
                }
                res.json(d);
            }).catch(function(errors){
                logger.error(errors);
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
                    if (f == 'changes' || f == 'children') 
                        continue;
        
                    let value = req.body[f];
                    if (f == 'creator' || f == 'createdBy')  {
                        f = 'creatorId';
                        value = value ? value.id : null;
                    } else if (f == 'owner') {
                        f = 'ownerId',
                        value = value ? value.id : null;
                    }
                    if (value && typeof(value) === 'object') {
                        console.log("unrecongnized change.", f, value);
                        continue;
                    }
                    if (d[f] != value) {
                        origin[f] = d[f];
                        changes[f] = value;
                    }
                }

                return d.update(changes).then(function(d) {
                    res.json(d);
                }).then(() => {
                    models.defectHistory.saveFor(d, changes, req.user.id);
                });
            }).catch(function(errors){
                logger.error(errors);
                res.sendStatus(500);
            });
        })
        .delete(function(req, res){
            models.defect.findById(req.params.id).then(function(d) {
                d.destroy().then(function(d) {
                    res.json(req.params.id);
                })
                .catch(function(errors){
                     logger.error(errors);
                res.sendStatus(500);
                });
            }).catch(function(errors){
                logger.error(errors);
                res.sendStatus(500);
            });
        });

    router.route('/defects/:id/fix')
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
                logger.error(errors);
                res.sendStatus(500);
            });
        });

    router.route('/defects/:id/test')
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
                logger.error(errors);
                res.sendStatus(500);
            });
        });

    // '/api/defects/' + defect.id + '/comments'
    router.route('/defects/:id/comments')
        .post(function(req, res) {
            models.sequelize.transaction(function(t) {
                return models.defect.findById(req.params.id).then(defect => {
                    let comment = { content: req.body.message, userId: req.user.id };
                    return models.comment.create(comment).then((c) => {
                        let dc = {defectId: defect.id, commentId: c.id};
                        return models.defectComment.create(dc).then(() => {
                            res.json({"result": "created"});
                        })
                    });
                })
            }).then(function(){
                res.end();
            }).catch(function(errors) {
                logger.error(errors);
                res.sendStatus(500);
            });
        })
        .get(function(req, res) {
            return models.defect.findById(req.params.id).then(defect => {
                return models.defectComment.findAll({where: {defectId: defect.id}, include: [{model: models.comment}]})
                    .then(cms => {
                        let comments = cms.map(c => c.comment).sort((a, b) => a.createdAt > b.createdAt);
                        res.json(comments);
                    });
            }).catch(function(errors) {
                logger.error(errors);
                res.sendStatus(500);
            });
        });
};
